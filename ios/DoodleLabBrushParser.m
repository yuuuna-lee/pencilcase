//
//  DoodleLabBrushParser.m
//  DoodleLabBrushParser
//
//  Created by IYUNA on 2024. 7. 24..
//

#import "DoodleLabBrushParser.h"
#import <SSZipArchive/SSZipArchive.h>
#import <UIKit/UIKit.h>
#import <CoreImage/CoreImage.h>

@implementation DoodleLabBrushParser

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(parseBrushFile:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[DoodleLabBrushParser] parseBrushFile called with path: %@", filePath);
    NSString *cleanedPath = [filePath stringByReplacingOccurrencesOfString:@"file://" withString:@""];
    NSLog(@"[DoodleLabBrushParser] Cleaned path: %@", cleanedPath);
    if (![[NSFileManager defaultManager] fileExistsAtPath:cleanedPath]) {
        NSLog(@"[DoodleLabBrushParser] File does not exist: %@", cleanedPath);
        reject(@"E_FILE_NOT_FOUND", @"File does not exist", nil);
        return;
    }
    NSString *tempDir = [NSTemporaryDirectory() stringByAppendingPathComponent:[[NSUUID UUID] UUIDString]];
    NSError *dirErr = nil;
    [[NSFileManager defaultManager] createDirectoryAtPath:tempDir withIntermediateDirectories:YES attributes:nil error:&dirErr];
    if (dirErr) {
        NSLog(@"[DoodleLabBrushParser] Failed to create temp dir: %@", dirErr);
        reject(@"E_TMP_DIR", @"Failed to create temp dir", dirErr);
        return;
    }
    BOOL unzipSuccess = [SSZipArchive unzipFileAtPath:cleanedPath toDestination:tempDir];
    NSLog(@"[DoodleLabBrushParser] Unzip success: %@", unzipSuccess ? @"YES" : @"NO");
    if (!unzipSuccess) {
        reject(@"E_UNZIP_FAILED", @"Failed to unzip brush file", nil);
        [[NSFileManager defaultManager] removeItemAtPath:tempDir error:nil];
        return;
    }
    // UTF8 인코딩으로 파일 목록 읽기
    NSError *listErr = nil;
    NSArray *files = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:tempDir error:&listErr];
    if (listErr) {
        NSLog(@"[DoodleLabBrushParser] Directory listing error: %@", listErr);
    }
    NSLog(@"[DoodleLabBrushParser] Files in tempDir: %@", files);
    NSString *shapeFile = nil;
    for (NSString *f in files) {
        NSString *lower = [f.lowercaseString precomposedStringWithCanonicalMapping];
        if ([lower containsString:@"shape.png"]) {
            shapeFile = f;
            break;
        }
    }
    if (!shapeFile) {
        NSLog(@"[DoodleLabBrushParser] shape.png not found");
        reject(@"NO_SHAPE", @"Shape.png not found", nil);
        [[NSFileManager defaultManager] removeItemAtPath:tempDir error:nil];
        return;
    }
    NSString *shapePath = [tempDir stringByAppendingPathComponent:shapeFile];
    NSData *imageData = [NSData dataWithContentsOfFile:shapePath];
    UIImage *image = [UIImage imageWithData:imageData];
    NSString *shapeBase64 = @"";
    if (image && image.CGImage) {
        CIImage *inputImage = [CIImage imageWithCGImage:image.CGImage];
        CIFilter *maskToAlpha = [CIFilter filterWithName:@"CIMaskToAlpha"];
        [maskToAlpha setValue:inputImage forKey:kCIInputImageKey];
        CIImage *outputImage = maskToAlpha.outputImage;
        if (outputImage) {
            CIContext *context = [CIContext contextWithOptions:nil];
            CGImageRef cgimg = [context createCGImage:outputImage fromRect:[outputImage extent]];
            if (cgimg) {
                UIImage *finalImage = [UIImage imageWithCGImage:cgimg];
                NSData *finalData = UIImagePNGRepresentation(finalImage);
                shapeBase64 = [finalData base64EncodedStringWithOptions:0];
                CGImageRelease(cgimg);
                NSLog(@"[DoodleLabBrushParser] shape.png processed and base64 encoded");
            } else {
                NSLog(@"[DoodleLabBrushParser] Failed to create CGImage from outputImage");
            }
        } else {
            NSLog(@"[DoodleLabBrushParser] maskToAlpha outputImage is nil");
        }
    } else {
        NSLog(@"[DoodleLabBrushParser] Failed to load shape.png as UIImage");
    }
    // Brush.archive도 인코딩 문제 없이 찾기
    NSString *archiveFile = nil;
    for (NSString *f in files) {
        NSString *lower = [f.lowercaseString precomposedStringWithCanonicalMapping];
        if ([lower containsString:@"brush.archive"]) {
            archiveFile = f;
            break;
        }
    }
    NSString *archivePath = archiveFile ? [tempDir stringByAppendingPathComponent:archiveFile] : nil;
    BOOL is3DBrush = NO;
    if (archivePath && [[NSFileManager defaultManager] fileExistsAtPath:archivePath]) {
        NSData *archiveData = [NSData dataWithContentsOfFile:archivePath];
        NSString *archiveText = [[NSString alloc] initWithData:archiveData encoding:NSUTF8StringEncoding];
        NSArray *keywords = @[ @"metallicScale", @"roughnessScale", @"heightScale", @"bundledRoughnessPath", @"bundledHeightPath", @"bundledMetallicPath", @"texturizedGrainFollowsCamera", @"hoverOutline", @"hoverFill", @"hoverPressure" ];
        for (NSString *kw in keywords) {
            if ([archiveText containsString:kw]) {
                is3DBrush = YES;
                break;
            }
        }
        NSLog(@"[DoodleLabBrushParser] Brush.archive found, is3DBrush: %@", is3DBrush ? @"YES" : @"NO");
    } else {
        NSLog(@"[DoodleLabBrushParser] Brush.archive not found");
    }
    NSString *name = [cleanedPath lastPathComponent];
    resolve(@{
        @"name": name ?: @"",
        @"shapeImageBase64": shapeBase64 ?: @"",
        @"is3DBrush": @(is3DBrush)
    });
    [[NSFileManager defaultManager] removeItemAtPath:tempDir error:nil];
}

@end