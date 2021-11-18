/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>
#import "Detector.h"
@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property () BOOL restrictRotation;
@property (nonatomic, assign) UIBackgroundTaskIdentifier taskIdentifier;
@property (nonatomic, strong) UIWindow *window;
-(void)DismisstopMostController;
-(void)OpenAVPlayer : (NSString*)strURL;
@end
