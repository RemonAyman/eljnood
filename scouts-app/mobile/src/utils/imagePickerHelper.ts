import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { validateAndSanitizeBase64Image } from './securityUtils';

/**
 * Options for picking an image
 */
export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number; // 0.1 to 1.0 (default 0.4 to keep Base64 payload compact for Firestore)
}

/**
 * Helper to compress and format Base64 URI string
 */
export function formatBase64DataUri(base64String: string, mimeType: string = 'image/jpeg'): string {
  const cleanBase64 = base64String.replace(/[\r\n\s]/g, '');
  if (cleanBase64.startsWith('data:image')) {
    return cleanBase64;
  }
  return `data:${mimeType};base64,${cleanBase64}`;
}

/**
 * Universal URI to Base64 converter that works across Web, Android, and iOS.
 * Resolves file://, content://, and blob: URIs to standard data:image Base64 string.
 */
export async function convertUriToBase64(uri: string): Promise<string | null> {
  if (!uri) return null;
  if (uri.startsWith('data:image')) {
    return uri;
  }

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('convertUriToBase64 error:', error);
    return null;
  }
}

/**
 * Fallback file picker for Web browsers
 */
export function pickImageFromWebFileInput(): Promise<string | null> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return resolve(null);
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          if (document.body.contains(input)) document.body.removeChild(input);
          resolve(event.target.result as string);
        };
        reader.onerror = () => {
          if (document.body.contains(input)) document.body.removeChild(input);
          resolve(null);
        };
        reader.readAsDataURL(file);
      } else {
        if (document.body.contains(input)) document.body.removeChild(input);
        resolve(null);
      }
    };

    input.click();
  });
}

/**
 * Launch device image gallery and return Base64 Data URI string
 */
export async function pickImageFromGallery(
  options: ImagePickerOptions = {}
): Promise<string | null> {
  try {
    const { allowsEditing = true, aspect = [1, 1], quality = 0.4 } = options;

    // Web platform direct file picker
    if (Platform.OS === 'web') {
      const webResult = await pickImageFromWebFileInput();
      if (webResult) {
        return validateAndSanitizeBase64Image(webResult) || webResult;
      }
    }

    // Native Mobile (Android & iOS)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'الصلاحية مطلوبة ⚠️',
        'يرجى السماح للتطبيق بالوصول إلى المعرض لاختيار الصورة'
      );
      return null;
    }

    // Launch gallery with compatibility flags
    const mediaTypesOption = (ImagePicker.MediaTypeOptions?.Images || ['images']) as any;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaTypesOption,
      allowsEditing,
      aspect,
      quality,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // 1. Direct base64 if returned by native picker
    if (asset.base64) {
      const mime = asset.mimeType || 'image/jpeg';
      const fullBase64 = formatBase64DataUri(asset.base64, mime);
      return validateAndSanitizeBase64Image(fullBase64) || fullBase64;
    }

    // 2. Convert file/content URI to base64 if asset.base64 wasn't attached
    if (asset.uri) {
      const converted = await convertUriToBase64(asset.uri);
      if (converted) {
        return validateAndSanitizeBase64Image(converted) || converted;
      }
    }

    return null;
  } catch (error: any) {
    console.error('Error picking image from gallery:', error);
    // On web or native fallback
    if (Platform.OS === 'web') {
      const webFallback = await pickImageFromWebFileInput();
      if (webFallback) return webFallback;
    }
    Alert.alert('خطأ في اختيار الصورة', error?.message || 'تعذر فتح معرض الصور بالجهاز');
    return null;
  }
}

/**
 * Launch device camera and return Base64 Data URI string
 */
export async function takePhotoWithCamera(
  options: ImagePickerOptions = {}
): Promise<string | null> {
  try {
    const { allowsEditing = true, aspect = [1, 1], quality = 0.4 } = options;

    if (Platform.OS === 'web') {
      // In web browser, standard camera input or file picker
      const webResult = await pickImageFromWebFileInput();
      if (webResult) {
        return validateAndSanitizeBase64Image(webResult) || webResult;
      }
    }

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert(
        'الصلاحية مطلوبة ⚠️',
        'يرجى السماح للتطبيق بالوصول إلى الكاميرا لالتقاط صورة جديدة'
      );
      return null;
    }

    const mediaTypesOption = (ImagePicker.MediaTypeOptions?.Images || ['images']) as any;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: mediaTypesOption,
      allowsEditing,
      aspect,
      quality,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // 1. Direct base64
    if (asset.base64) {
      const mime = asset.mimeType || 'image/jpeg';
      const fullBase64 = formatBase64DataUri(asset.base64, mime);
      return validateAndSanitizeBase64Image(fullBase64) || fullBase64;
    }

    // 2. Convert URI to Base64
    if (asset.uri) {
      const converted = await convertUriToBase64(asset.uri);
      if (converted) {
        return validateAndSanitizeBase64Image(converted) || converted;
      }
    }

    return null;
  } catch (error: any) {
    console.error('Error taking photo:', error);
    Alert.alert('خطأ في الكاميرا', error?.message || 'تعذر التقاط صورة عبر الكاميرا');
    return null;
  }
}
