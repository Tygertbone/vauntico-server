export default function CourseComparisonTable() {
  const features = [
    {
      category: "Core Offering",
      items: [
        { name: "Complete 60-day system", r2k: true, others: "partial" },
        { name: "Phone-only (no computer needed)", r2k: true, others: false },
        { name: "African-focused examples & brands", r2k: true, others: false },
        { name: "M-Pesa/MoMo payment support", r2k: true, others: false },
      ]
    },
    {
      category: "Content & Learning",
      items: [
        { name: "Daily action plans", r2k: true, others: "partial" },
        { name: "Video tutorials", r2k: true, others: true },
        { name: "100+ content templates", r2k: true, others: "paid extra" },
        { name: "African Brands Directory (200+)", r2k: true, others: false },
      ]
    },
    {
      category: "Community & Support",
      items: [
        { name: "Ubuntu R2K Creators WhatsApp Hub", r2k: true, others: false },
        { name: "Weekly live Q&A sessions", r2k: true, others: "paid extra" },
        { name: "Phase-specific support channels", r2k: true, others: false },
        { name: "Pan-African community (4 countries)", r2k: true, others: false },
      ]
    },
    {
      category: "Guarantee & Risk",
      items: [
        { name: "60-day money-back guarantee", r2k: true, others: "30 days" },
        { name: "Results-based refund (R2K or refund)", r2k: true, others: false },
        { name: "Lifetime access", r2k: true, others: "annual fee" },
        { name: "No hidden fees", r2k: true, others: false },
      ]
    },
    {
      category: "Pricing",
      items: [
        { name: "One-time payment option", r2k: "R997", others: "R1,500+" },
        { name: "Payment plan option", r2k: "3×R349", others: "Not available" },
        { name: "Bonus value included", r2k: "R2,588", others: "R0-500" },
        { name: "Total cost", r2k: "R997", others: "R1,500-R5,000" },
      ]
    }
  ]

  const renderCheckmark = (value) => {
    if (value === true) {
      return <span className="text-green-500 text-2xl font-bold">✓</span>
    } else if (value === false) {
      return <span className="text-red-500 text-2xl font-bold">✗</span>
    } else if (typeof value === 'string') {
      return <span className="text-sm font-semibold text-gray-700">{value}</span>
    }
    return <span className="text-yellow-500 text-sm">~</span>
  }

  return (
    <div className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            How Does R2K Challenge Compare?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We built this for African creators. See the difference for yourself.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
          
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-gradient-to-r from-purple-600 to-green-600 text-white">
            <div className="p-6 border-r border-white/20">
              <h3 className="text-lg font-bold">Feature</h3>
            </div>
            <div className="p-6 border-r border-white/20 bg-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🦄</span>
                <h3 className="text-lg font-bold">R2K Challenge</h3>
              </div>
              <p className="text-xs opacity-90">(That's us!)</p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold">Other Courses</h3>
              <p className="text-xs opacity-90">Industry average</p>
            </div>
          </div>

          {/* Table Body */}
          {features.map((category, idx) => (
            <div key={idx}>
              {/* Category Header */}
              <div className="bg-purple-50 px-6 py-3 border-b border-gray-200">
                <h4 className="font-bold text-purple-900">{category.category}</h4>
              </div>

              {/* Category Items */}
              {category.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className={`grid grid-cols-3 border-b border-gray-200 ${
                    itemIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="p-4 border-r border-gray-200">
                    <p className="text-sm text-gray-700">{item.name}</p>
                  </div>
                  <div className="p-4 border-r border-gray-200 text-center bg-green-50/50">
                    {renderCheckmark(item.r2k)}
                  </div>
                  <div className="p-4 text-center">
                    {renderCheckmark(item.others)}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer CTA */}
          <div className="bg-gradient-to-r from-purple-50 to-green-50 p-8 text-center border-t-4 border-purple-600">
            <p className="text-2xl font-bold text-gray-900 mb-4">
              The Choice is Clear 🎯
            </p>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              More value. Better support. African-first focus. Phone-only system. 
              And the only course with a results-based guarantee.
            </p>
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="inline-block bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚀 Start Your R2,000 Journey Now
            </a>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-xl">✓</span>
            <span>Included</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xl">✗</span>
            <span>Not included</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xl">~</span>
            <span>Limited/Partial</span>
          </div>
        </div>
      </div>
    </div>
  )
}
