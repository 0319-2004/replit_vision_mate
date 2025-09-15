// 基本的なAppコンポーネント（テスト用）
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        VisionMates - 動作テスト
      </h1>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">システム状況</h2>
        <div className="space-y-2">
          <p className="text-green-600">✅ React 正常動作</p>
          <p className="text-green-600">✅ Vite 正常動作</p>
          <p className="text-green-600">✅ TailwindCSS 正常動作</p>
        </div>
      </div>
    </div>
  );
}
