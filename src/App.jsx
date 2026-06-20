function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center shadow-2xl border border-white/20">
        <div className="text-6xl mb-4">🚀</div>

        <h1 className="text-4xl font-bold text-white mb-3">
          Halo Ruang Belajar
        </h1>

        <p className="text-gray-200 mb-6">
          Tempat belajar coding, membangun project, dan meningkatkan skill
          menjadi programmer profesional.
        </p>

        <div className="flex justify-center gap-4">
          <button className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-xl hover:scale-105 transition duration-300">
            Mulai Belajar
          </button>

          <button className="border border-white text-white px-6 py-3 rounded-xl hover:bg-white/10 transition duration-300">
            Pelajari Lagi
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;