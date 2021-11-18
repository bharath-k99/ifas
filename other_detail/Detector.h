//
//  Detector.h
//  DetectScreenRecorder
//
//  Created by Vandana on 14/02/19.
//  Copyright © 2019 Mahipal Singh. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

extern NSString *kScreenRecordingDetectorRecordingStatusChangedNotification;

@interface Detector : NSObject

+(instancetype)sharedInstance;
 
- (BOOL)isRecording;
- (void)checkCurrentRecordingStatus;

@end

NS_ASSUME_NONNULL_END
