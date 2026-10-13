# Homepage port

The Expo home route in `src/app/index.tsx` ports the frontend's Pinned and Recent sections. It uses the same `/scrapper/pinned?pageType=homePage` and `/scrapper/all?pageType=homePage` endpoints and copies the homepage images from `frontend/public`.

1. Copy `.env.example` to `.env.local`.
2. Set `EXPO_PUBLIC_API_URL` to your API URL. For a physical phone, use the computer's LAN IP (not localhost); both devices must be on the same network. For the Android emulator, use `http://10.0.2.2:3001`.
3. Set `EXPO_PUBLIC_FRONTEND_URL` to the frontend URL. Post cards and See more open it in the browser until those pages are ported.
4. Start the existing API and frontend, then run `npm start` inside `postarch-mobile` and open it in Expo Go. Restart Expo after changing environment variables.

All nine frontend components are now ported under `src/components`, with the same names and card/modal props. Navbar and Main-side-panel are connected to the homepage, including the Reddit/YouTube Add flow. Cards retain pin, list, and delete actions; PostCard retains list membership toggling. Other pages and the existing Explore tab remain outside this change. The desktop four-column grid becomes two columns on phones, three on tablets, and four on wider screens.

The components use the frontend's exact green/silver gradient stops, radial highlights, gloss, card fades, section overlays, shadows, and original navigation images. SVG backgrounds render through the installed Expo Image module. The sidebar stacks on wide screens and uses a two-by-two control grid on phones; cards keep two columns on phones. Native modal controls retain mobile touch sizes. CSS backdrop blur and font rendering can differ between platforms. Like the frontend, Navbar search goes to All without applying the entered text, and Filters-section keeps selections locally without filtering data. The frontend's unused HTML-save helper is not exposed as a new action.

Validation: TypeScript and focused lint passed; Expo Android export with Hermes passed. Live API data and native device appearance have not been verified.
