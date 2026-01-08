// Copyright 2025-present 650 Industries. All rights reserved.

import ExpoModulesJSI
@_implementationOnly import ExpoModulesJSISwift

/**
 Class that extends the standard JavaScript runtime with some Expo-specific features.
 For instance, the global `expo` object is available only in Expo runtimes.
 */
public class ExpoRuntime: JavaScriptRuntime, @unchecked Sendable {
//  internal var pointee: facebook.jsi.Runtime {
//    return unsafe_pointee.load(as: facebook.jsi.Runtime.self)
//  }

  @JavaScriptActor
  internal func getCoreObject() throws -> JavaScriptObject {
    fatalError("Unimplemented")
//    return try global().getProperty(EXGlobalCoreObjectPropertyName).asObject()
  }

  @JavaScriptActor
  internal func createNativeModuleObject() throws -> JavaScriptObject {
//    class W {
//      private let object: facebook.jsi.Object
//      init(_ object: consuming facebook.jsi.Object) {
//        self.object = object
//      }
//    }
//    let jsiObject = expo.NativeModule.createInstance(pointee)
//    let ptr = Unmanaged<W>.passUnretained(W(jsiObject)).toOpaque()

    return JavaScriptObject(self)//, UnsafeRawPointer(ptr))
  }

  @JavaScriptActor
  internal func getSharedObjectClass() throws -> JavaScriptObject {
    fatalError("Unimplemented")
//    return try getCoreObject().getProperty("SharedObject").asObject()
  }

  @JavaScriptActor
  internal func getSharedRefClass() throws -> JavaScriptObject {
    fatalError("Unimplemented")
//    return try getCoreObject().getProperty("SharedRef").asObject()
  }

  @JavaScriptActor
  internal func createSharedObjectClass(_ name: String, constructor: SyncFunctionClosure) -> JavaScriptObject {
    fatalError()
  }

  @JavaScriptActor
  internal func createSharedRefClass(_ name: String, constructor: SyncFunctionClosure) -> JavaScriptObject {
    fatalError()
  }
}
