import Foundation

@objc(DoodleLabBrushParser)
class DoodleLabBrushParser: NSObject {

  @objc(greeting:rejecter:)
  func greeting(_ resolve: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) -> Void {
    resolve("Hello from Swift! Manually setup 👋")
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    // UI 관련 작업이 없으면 false, 있으면 true. 지금은 안전하게 true로 둡니다.
    return true
  }
}
