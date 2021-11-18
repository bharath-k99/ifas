export default function renderIf(condition, content) {
    if (condition) {
        return content;
    } else {
        return null;
    }
}

// export function openSettingsPage() {
//     if (Platform.OS === 'ios') {
//         Linking.canOpenURL('app-settings:').then(supported => {
//             if (!supported) {
//             } else {
//                 return Linking.openURL('app-settings:');
//             }
//         }).catch(err => console.error('An error occurred', err))
//     } else {
//         NativeModules.MyNative.openNetworkSettings(data => {
//             alert(data)
//         })
//     }
// }