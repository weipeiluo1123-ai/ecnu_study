---
title: "React Native 跨平台开发实战指南"
date: 2026-04-12
author: weipeiluo
description: "从项目初始化到应用商店上架，完整讲解 React Native 跨平台开发的实践经验、性能优化策略和原生模块集成方案。"
category: "mobile"
tags:
  - React
  - JavaScript
  - 性能优化
  - 教程
published: true
featured: false
---

React Native 允许我们用 JavaScript 和 React 构建真正的原生移动应用，一套代码同时运行在 iOS 和 Android 上。

## 项目架构

一个生产级别的 React Native 项目需要合理规划目录结构和架构分层：

```
src/
├── components/       # 通用组件
├── screens/          # 页面
├── navigation/       # 路由配置
├── services/         # API 请求
├── hooks/            # 自定义 Hooks
├── store/            # 状态管理
├── native/           # 原生模块桥接
└── utils/            # 工具函数
```

### 导航方案

React Navigation 是目前社区最主流的导航库：

```typescript
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 性能优化

### 列表性能

FlatList 是 React Native 中最常用的列表组件，但使用不当会导致性能问题：

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  removeClippedSubviews={true}    // 移除屏幕外的视图
  maxToRenderPerBatch={10}         // 每次渲染的最大数量
  windowSize={5}                   // 渲染窗口大小
  getItemLayout={getItemLayout}    // 固定高度时启用
/>
```

### 图片优化

- 使用 `react-native-fast-image` 替代默认 Image 组件
- 图片尺寸与服务端返回一致，避免客户端缩放
- 启用渐进式加载和缓存策略

### 动画性能

使用 `react-native-reanimated` 代替 Animated API，所有动画在 UI 线程执行：

```typescript
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

function AnimatedCard() {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      onTouchStart={() => { scale.value = withSpring(0.95); }}
      onTouchEnd={() => { scale.value = withSpring(1); }}
    />
  );
}
```

## 原生模块集成

当需要访问平台特定 API 时，可以编写原生模块。以下是一个相机模块的桥接示例：

### Android (Java)

```java
@ReactMethod
public void openCamera(Promise promise) {
    Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    if (intent.resolveActivity(getReactApplicationContext().getPackageManager()) != null) {
        // 启动相机
        promise.resolve(true);
    } else {
        promise.reject("CAMERA_ERROR", "找不到相机应用");
    }
}
```

### iOS (Swift)

```swift
@objc func openCamera(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    let picker = UIImagePickerController()
    picker.sourceType = .camera
    // 配置相机
    resolve(true)
}
```

## 状态管理

对于中等规模的应用，推荐使用 Zustand 或 Jotai 这类轻量级状态管理方案：

```typescript
import { create } from "zustand";

interface AuthState {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (credentials) => {
    const user = await api.login(credentials);
    set({ user });
  },
  logout: () => set({ user: null }),
}));
```

## 发布流程

- **iOS**: 通过 Xcode Archive → App Store Connect → TestFlight 内测 → 正式发布
- **Android**: 生成签名 APK/AAB → Google Play Console → 内部测试 → 正式发布

React Native 社区发展迅速，新架构（Fabric + TurboModules）已经稳定，建议新项目直接使用新架构模板创建，可以获得更好的性能和开发体验。
