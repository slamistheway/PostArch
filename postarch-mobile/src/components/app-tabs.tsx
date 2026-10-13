import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Image, Pressable } from 'react-native';
import AddSaveSheet from './add-save-sheet';

const icons = {
  index: require('@/assets/images/icons/home.png'),
  saves: require('@/assets/images/icons/saves.png'),
  add: require('@/assets/images/icons/add.png'),
  settings: require('@/assets/images/icons/settings.png'),
  info: require('@/assets/images/icons/info.png'),
};

export default function AppTabs() {
  const [addVisible, setAddVisible] = useState(false);
  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#315d2a',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarButton: ({ ref, ...props }) => {
          void ref;
          return <Pressable {...props} android_ripple={{ color: 'transparent' }} style={props.style} />;
        },
      }}>
        {(Object.keys(icons) as Array<keyof typeof icons>).map((name) => (
          <Tabs.Screen key={name} name={name} options={{
            title: name === 'index' ? 'Home' : name[0].toUpperCase() + name.slice(1),
            tabBarIcon: () => <Image source={icons[name]} style={{ width: 24, height: 24 }} />,
            ...(name === 'add' ? { tabBarButton: ({ ref, onPress, ...props }) => {
              void ref;
              void onPress;
              return <Pressable {...props} android_ripple={{ color: 'transparent' }} onPress={() => setAddVisible(true)} style={props.style} />;
            } } : {}),
          }} />
        ))}

        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="saves/all" options={{ href: null }} />
        <Tabs.Screen name="saves/posts" options={{ href: null }} />
        <Tabs.Screen name="saves/comments" options={{ href: null }} />
        <Tabs.Screen name="saves/lists" options={{ href: null }} />
        <Tabs.Screen name="saves/posts/[id]" options={{ href: null }} />
        <Tabs.Screen name="saves/comments/[id]" options={{ href: null }} />
        <Tabs.Screen name="saves/lists/[id]" options={{ href: null }} />
      </Tabs>
      <AddSaveSheet visible={addVisible} onClose={() => setAddVisible(false)} />
    </>
  );
}
