/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
#import "AppDelegate.h"
#import "Orientation.h"
#import <React/RCTLog.h>
 #import <React/RCTEventEmitter.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "RNSplashScreen.h"
//#import "RCTPushNotificationManager.h"
#import <Firebase.h>
#import "RNFirebaseNotifications.h"
#import "RNFirebaseMessaging.h"
#import <AVKit/AVPlayerViewController.h>

#import "RNBackgroundDownloader.h"
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
 
  
  [FIRApp configure];
  [RNFirebaseNotifications configure];
  self.restrictRotation = YES;

  NSURL *jsCodeLocation;
//  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
 jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  
//  UIScreen *mainScreen = [UIScreen mainScreen];
//  [mainScreen addObserver: Detector.sharedInstance forKeyPath:@"captured" options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld context:NULL];
  
//  if (@available(iOS 11.0, *)) {
//    BOOL isCaptured = [[UIScreen mainScreen] isCaptured];
//    if(isCaptured){
//       // Do the action for hiding the screen recording
//                 ScreenRecorderDetect *manager = [ScreenRecorderDetect allocWithZone: nil];
//                 [manager isScreenCaptureEnabled:UIScreen.mainScreen.isCaptured];
//    }
//   } else{
//        // Fallback on earlier versions
//         }


  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"ifasApp"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];



  [RNSplashScreen show];

  


  return YES;
}


- (void)applicationWillResignActive:(UIApplication *)application {
    if (self.taskIdentifier != UIBackgroundTaskInvalid) {
        [application endBackgroundTask:self.taskIdentifier];
        self.taskIdentifier = UIBackgroundTaskInvalid;
      
    }
    
    __weak typeof(self) weakSelf = self;
    self.taskIdentifier = [application beginBackgroundTaskWithName:nil expirationHandler:^{
        [application endBackgroundTask:weakSelf.taskIdentifier];
        weakSelf.taskIdentifier = UIBackgroundTaskInvalid;
    }];
}

- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)(void))completionHandler
{
  [RNBackgroundDownloader setCompletionHandlerWithIdentifier:identifier completionHandler:completionHandler];
}
 
+ (UIViewController*) topMostController {
  UIViewController *topController = [UIApplication sharedApplication].keyWindow.rootViewController;
  
  while (topController.presentedViewController) {
    topController = topController.presentedViewController;
  }
  
  return topController;
}

 -(void)DismisstopMostController {
  UIViewController *topController = [UIApplication sharedApplication].keyWindow.rootViewController;
  
  while (topController.presentedViewController) {
    topController = topController.presentedViewController;
  }
  [topController dismissViewControllerAnimated:true completion:nil];
}

-(void)OpenAVPlayer : (NSString*)strURL{
  NSLog(@"strURL %@",strURL);
  NSURL *videoURL = [NSURL URLWithString:strURL];
  AVPlayer *player = [AVPlayer playerWithURL:videoURL];
  AVPlayerViewController *playerViewController = [AVPlayerViewController new];
  playerViewController.player = player;
  [self.window.rootViewController presentViewController:playerViewController animated:YES completion:^{
    [playerViewController.player play];
  }];
}



- (void)applicationDidBecomeActive:(UIApplication *)application {
  // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
//  UIScreen *mainScreen = [UIScreen mainScreen];
//  [mainScreen addObserver: Detector.sharedInstance forKeyPath:@"captured" options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld context:NULL];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:kScreenRecordingDetectorRecordingStatusChangedNotification
                                                object:nil];
  
//  UIScreen *mainScreen = [UIScreen mainScreen];
//  [mainScreen removeObserver:Detector.sharedInstance forKeyPath:@"captured" context:NULL];
}


// Required to register for notifications
//- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
//{
////  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
//}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  NSString *tokenString = [deviceToken description];
  tokenString = [[deviceToken description] stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"<>"]];
  tokenString = [tokenString stringByReplacingOccurrencesOfString:@" " withString:@""];
  NSLog(@"Push Notification tokenstring is %@",tokenString);
}


- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    NSLog(@"UIInterfaceOrientationMask");
//    while ([[UIDevice currentDevice] isGeneratingDeviceOrientationNotifications]) {
//      [[UIDevice currentDevice] endGeneratingDeviceOrientationNotifications];
//    }
  if(self.restrictRotation)
      return UIInterfaceOrientationMaskPortrait;
  else
      return UIInterfaceOrientationMaskAll;
  }
@end
