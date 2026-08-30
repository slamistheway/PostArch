from yt_dlp import YoutubeDL
import logging
import sys
from datetime import datetime
import re


# Configure logging
logging.basicConfig(
    filename="output.txt",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("yt-dlp")


class MyLogger:
    def debug(self, msg):
        logger.debug(msg)

    def info(self, msg):
        logger.info(msg)

    def warning(self, msg):
        logger.warning(msg)

    def error(self, msg):
        logger.error(msg)


def clean_filename(name):
    """
    Remove characters that are invalid in Windows filenames.
    """
    return re.sub(r'[<>:"/\\|?*]', '', name)


if __name__ == "__main__":
    url = sys.argv[1]

    # Create timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # First configuration: only fetch metadata
    info_options = {
        "logger": MyLogger(),
        "skip_download": True,
    }

    with YoutubeDL(info_options) as ydl:
        info = ydl.extract_info(url, download=False)
        title = info.get("title", "unknown_title")
        uploader = info.get("uploader", "unknown_uploader")

        print(f"Title: {title}")
        print(f"Uploader: {uploader}")

        title = clean_filename(title)
        uploader = clean_filename(uploader)

        filename = f"{title}_{timestamp}.%(ext)s"

        print(f"Filename: {filename}")

        download_options = {
            "logger": MyLogger(),
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": filename,
        }

        with YoutubeDL(download_options) as downloader:
            downloader.download([url])