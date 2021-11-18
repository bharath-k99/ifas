//
//  RNScreenRecorder.m
//  ifasApp
//
//  Created by cgt_jpr_pc_admin on 16/05/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "RNScreenRecorder.h"
#import <React/RCTLog.h>

@implementation RNScreenRecorder

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
{
  RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}


@end


