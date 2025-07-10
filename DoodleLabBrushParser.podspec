require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  # The name of the pod, which should match the module name.
  s.name         = "DoodleLabBrushParser"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  # This is a local pod, so the source is the current directory.
  s.source       = { :path => "." }
  s.source_files  = "ios/**/*.{h,m,mm,swift}"

  # The minimum platform version (updated for SSZipArchive compatibility)
  s.platforms    = { :ios => "13.4" }
  s.requires_arc = true

  # React Native dependencies.
  s.dependency "React-Core"
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly"
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"
  
  # Additional dependencies for brush parsing (using older compatible version)
  s.dependency "SSZipArchive", "~> 2.2.0"
end