//
//  SFViewControl.h
//  ifasApp
//
//  Created by cgt_jpr_pc_admin on 11/06/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <UIKit/UIKit.h>
#import <React/RCTEventEmitter.h>


@import SafariServices;
NS_ASSUME_NONNULL_BEGIN

@interface SFViewControl : RCTEventEmitter <RCTBridgeModule, SFSafariViewControllerDelegate>
@end

NS_ASSUME_NONNULL_END
