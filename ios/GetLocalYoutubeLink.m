//
//  GetLocalYoutubeLink.m
//  ifasApp
//
//  Created by Bhavesh Rathi on 06/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GetLocalYoutubeLink.h"
typedef void (^CompleteFileSave)(BOOL success);

@implementation GetLocalYoutubeLink

RCT_EXPORT_MODULE()

RCT_REMAP_METHOD(getLocalYoutubeUrl,params:(NSString *)infoFikeName resolver: (RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [self saveYoutubeInfoFile:^(BOOL success) {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
     NSString  *filePath = [NSString stringWithFormat:@"%@/%@", documentsDirectory,@"get_video_info_new.txt"];
    if (filePath){
      NSLog(@"inside if");
      NSString *userInfoFileContent = [[NSString alloc] initWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:NULL];
      NSString *path = userInfoFileContent;
      NSString *text = path;
      NSLog(@"%@",text);
      NSArray *x = [text componentsSeparatedByString:@"&"];
      NSMutableDictionary *t = [[NSMutableDictionary alloc] init];
      NSMutableArray *g = [[NSMutableArray alloc]init];
      NSMutableDictionary *h = [[NSMutableDictionary alloc]init];
      for(NSString *city in x){
        NSLog(@"%@",city);
        NSArray *c = [city componentsSeparatedByString:@"="];
        NSString *n = [c objectAtIndex:0];
        NSLog(@"%@",n);
        NSString *v = [c objectAtIndex:1];
        NSURL *url = [NSURL URLWithString:v];
        NSString *y = [v stringByRemovingPercentEncoding];
        [t setValue:v forKey:n];
      }
      NSString *y = [[t objectForKey:@"url_encoded_fmt_stream_map"] stringByRemovingPercentEncoding];
      NSArray *streams = [y componentsSeparatedByString:@","];
      NSLog(@"%@",t);
      int count = 0;
      for(NSString *dt in streams){
        h = [[NSMutableDictionary alloc]init];
        NSArray *x = [dt componentsSeparatedByString:@"&"];
        for(NSString *r in x){
          NSArray *c = [r componentsSeparatedByString:@"="];
          if ([[c objectAtIndex:0] isEqualToString:@"itag"]){
            switch ([[c objectAtIndex:1] integerValue]) {
              case 18:
                NSLog(@"The first letter of the alphabet 18");
                [h setObject:@"mp4" forKey:@"mimeType"];
                [h setObject:@"640" forKey:@"width"];
                [h setObject:@"360" forKey:@"height"];
                [h setObject:@"360p" forKey:@"qualityLabel"];
                NSLog(@"h value %@",h);
                break;
              case 22:
                NSLog(@"The  last letter of the alphabet 22");
                [h setObject:@"mp4" forKey:@"mimeType"];
                [h setObject:@"1280" forKey:@"width"];
                [h setObject:@"720" forKey:@"height"];
                [h setObject:@"720p" forKey:@"qualityLabel"];
                NSLog(@"h value %@",h);
                break;
              case 43:
                NSLog(@"The last letter of the alphabet 43");
                [h setObject:@"webm" forKey:@"mimeType"];
                [h setObject:@"640" forKey:@"width"];
                [h setObject:@"360" forKey:@"height"];
                [h setObject:@"360p" forKey:@"qualityLabel"];
                NSLog(@"h value %@",h);
                break;
              default:
                NSLog(@"Some other character");
                //              [h setObject:@"" forKey:@"mimeType"];
                //              [h setObject:@"" forKey:@"width"];
                //              [h setObject:@"" forKey:@"height"];
                //              [h setObject:@"" forKey:@"qualityLabel"];
            }
          }
          NSString *n = [c objectAtIndex:0];
          NSString *v = [c objectAtIndex:1];
          NSLog(@"%@before removingPercentEncoding",v);
          NSString *new = [v stringByRemovingPercentEncoding];
          NSLog(@"%@after removingPercentEncoding",new);
          [h setObject:new forKey:n];
          NSLog(@"h value after setting %@",h);
        }
        [g addObject:h];
//        [g add:h atIndex:count];
        count = count + 1;
      }
      NSError *error = nil;
      NSData *jsonData = [NSJSONSerialization dataWithJSONObject:g options:NSJSONWritingPrettyPrinted error:&error];
      NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
      NSLog(@"final json %@",jsonString);
      resolve(jsonString);
      
    }
    else{
      reject(@"no_events", @"There were no events", false);
    }
  }];
  
}

- (void)saveYoutubeInfoFile : (void (^)(BOOL success))finishBlock{
  NSString *newURL = @"https://www.youtube.com/get_video_info?video_id=J61XNjDuIg8&el=embedded&ps=default&eurl=&gl=US&hl=en";
  NSURL *url = [NSURL URLWithString:newURL];
  NSURLRequest *request = [NSURLRequest requestWithURL:url];
  NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    if (error == nil){
      NSData *receivedData = data;
      NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
      NSString  *documentsDirectory = [paths objectAtIndex:0];
      
      NSString  *filePath = [NSString stringWithFormat:@"%@/%@", documentsDirectory,@"get_video_info_new.txt"];
      [receivedData writeToFile:filePath atomically:YES];
      finishBlock(YES);
    }
    else{
      NSLog(@"%@",error.localizedDescription);
      finishBlock(NO);
    }
  }];
  [task resume];
}

@end
