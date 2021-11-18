//
//  RNScreenRecorder.h
//  ifasApp
//
//  Created by cgt_jpr_pc_admin on 16/05/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#if __has_include(<React/RCTBridgeModule.h>)
  #import <React/RCTBridgeModule.h>
#else
  #import "RCTBridgeModule.h"
#endif

NS_ASSUME_NONNULL_BEGIN

@interface RNScreenRecorder : NSObject <RCTBridgeModule>

@end

NS_ASSUME_NONNULL_END


