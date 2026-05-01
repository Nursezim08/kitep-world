import { Search, Menu, User, Package, Mail, Phone, MapPin, MessageCircle, Share2, Star, ChevronRight, Check } from "lucide-react";
import { GiBookmarklet } from "react-icons/gi";
import { LuClipboardPenLine } from "react-icons/lu";
import { FaChild } from "react-icons/fa6";
import { FaPencilAlt } from "react-icons/fa";
import { getLanguage, getTranslations } from './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import LoginButton from './components/LoginButton';

export default async function Home() {
  const lang = await getLanguage();
  const t = await getTranslations(lang, 'landing');

  const categories = [
    { name: t.categories.items.fiction, icon: GiBookmarklet, color: "bg-blue-100", iconColor: "text-blue-500" },
    { name: t.categories.items.educational, icon: FaPencilAlt, color: "bg-purple-100", iconColor: "text-purple-500" },
    { name: t.categories.items.stationery, icon: LuClipboardPenLine, color: "bg-green-100", iconColor: "text-green-500" },
    { name: t.categories.items.children, icon: FaChild, color: "bg-orange-100", iconColor: "text-orange-500" },
  ];

  const featuredProducts = [
    { id: 1, name: t.products.items.manas.name, price: 450, image: "/placeholder-book.jpg", category: t.products.items.manas.category, rating: 4.8, reviews: 124 },
    { id: 2, name: t.products.items.notebook.name, price: 120, image: "/placeholder-notebook.jpg", category: t.products.items.notebook.category, rating: 4.9, reviews: 89 },
    { id: 3, name: t.products.items.pens.name, price: 280, image: "/placeholder-pens.jpg", category: t.products.items.pens.category, rating: 4.7, reviews: 156 },
    { id: 4, name: t.products.items.paint.name, price: 650, image: "/placeholder-paint.jpg", category: t.products.items.paint.category, rating: 4.9, reviews: 203 },
  ];

  const steps = [
    { number: "01", title: t.howItWorks.steps.step1.title, desc: t.howItWorks.steps.step1.description },
    { number: "02", title: t.howItWorks.steps.step2.title, desc: t.howItWorks.steps.step2.description },
    { number: "03", title: t.howItWorks.steps.step3.title, desc: t.howItWorks.steps.step3.description },
  ];

  const benefits = [
    { icon: Check, title: t.benefits.items.quality.title, desc: t.benefits.items.quality.description, color: "bg-green-100", iconColor: "text-green-500" },
    { icon: Star, title: t.benefits.items.loyalty.title, desc: t.benefits.items.loyalty.description, color: "bg-orange-100", iconColor: "text-orange-500" },
    { icon: Package, title: t.benefits.items.assortment.title, desc: t.benefits.items.assortment.description, color: "bg-blue-100", iconColor: "text-blue-500" },
    { icon: MapPin, title: t.benefits.items.branches.title, desc: t.benefits.items.branches.description, color: "bg-purple-100", iconColor: "text-purple-500" },
  ];

  const reviews = [
    { name: t.reviews.items.review1.name, university: t.reviews.items.review1.university, avatar: "A+T", color: "4F46E5", text: t.reviews.items.review1.text },
    { name: t.reviews.items.review2.name, university: t.reviews.items.review2.university, avatar: "B+I", color: "059669", text: t.reviews.items.review2.text },
    { name: t.reviews.items.review3.name, university: t.reviews.items.review3.university, avatar: "N+A", color: "DC2626", text: t.reviews.items.review3.text },
  ];

  const faqs = [
    { q: t.faq.items.q1.question, a: t.faq.items.q1.answer },
    { q: t.faq.items.q2.question, a: t.faq.items.q2.answer },
    { q: t.faq.items.q3.question, a: t.faq.items.q3.answer },
    { q: t.faq.items.q4.question, a: t.faq.items.q4.answer },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="absolute top-2 left-0 right-0 z-50 mx-4 md:mx-8">
        <div className="bg-white/95 backdrop-blur-lg border border-gray-200 shadow-lg rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 flex items-center justify-center">
                  <img
                    src="/logonur.png"
                    alt="logo"
                    className="w-16 h-12"/>
                </div>
                <span className="text-xl md:text-xl font-bold bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
                  {t.header.logo}
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.catalog}</a>
                <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.about}</a>
                <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.branches}</a>
                <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.contacts}</a>
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <LanguageSwitcher initialLang={lang} />

                <LoginButton text={t.header.login} />

                <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors md:hidden">
                  <Menu className="w-6 h-6 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative w-full">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mt-6 md:mt-10 animate-fadeInDown">
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-bold text-black">{t.hero.badge}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight max-w-4xl mx-auto animate-fadeInUp">
                {t.hero.title} <span className="bg-gradient-to-r from-violet-500 to-violet-500 bg-clip-text text-transparent">{t.hero.titleHighlight}</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-semibold max-w-2xl mx-auto animate-fadeInUp">
                {t.hero.subtitle}
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto animate-scaleIn">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-lg transition-all font-semibold"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                  {t.hero.searchButton}
                </button>
              </div>

              <div className="flex flex-wrap gap-4 justify-center animate-fadeInUp">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-500 to-violet-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  {t.hero.catalogButton}
                </button>
                <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl border-2 border-gray-200 hover:border-violet-500 hover:text-violet-500 transition-all">
                  {t.hero.branchesButton}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
              <div className="relative px-8 py-16 md:py-20 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  {t.banner.title}
                </h2>
                <p className="text-lg md:text-xl text-blue-50 mb-8 font-semibold max-w-2xl mx-auto">
                  {t.banner.description}
                </p>
                <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all">
                  {t.banner.button}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                {t.categories.title}
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                {t.categories.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, idx) => (
                <button
                  key={idx}
                  className="group relative p-8 bg-white border-2 border-gray-100 rounded-3xl hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 ${category.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className={`w-20 h-20 ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                    <category.icon className={`w-10 h-10 ${category.iconColor} stroke-[2.5]`} />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2 relative z-10">
                    {category.name}
                  </h3>
                  <div className="flex items-center text-violet-500 font-bold relative z-10">
                    <span className="text-sm">{t.categories.viewButton}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                {t.products.title}
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                {t.products.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-violet-200 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                    <Package className="w-24 h-24 text-gray-300 group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <span className="inline-block px-3 py-1 bg-violet-50 text-violet-500 text-xs font-bold rounded-full">
                      {product.category}
                    </span>
                    
                    <h3 className="text-base font-bold text-black line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-violet-500 text-violet-500" />
                        <span className="text-sm font-bold text-black">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500 font-semibold">({product.reviews})</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold text-black">{product.price} {t.products.currency}</span>
                    </div>
                    
                    <button className="w-full py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                      {t.products.addToCart}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                {t.howItWorks.title}
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                {t.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, idx) => {
                const colors = [
                  { bg: "bg-blue-100", text: "text-blue-500" },
                  { bg: "bg-purple-100", text: "text-purple-500" },
                  { bg: "bg-green-100", text: "text-green-500" }
                ];
                return (
                  <div key={idx} className="relative">
                    <div className={`${colors[idx].bg} rounded-3xl p-8 hover:shadow-xl transition-all`}>
                      <div className={`text-6xl font-extrabold ${colors[idx].text} mb-6`}>
                        {step.number}
                      </div>
                      <h3 className="text-xl font-bold text-black mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed font-semibold">
                        {step.desc}
                      </p>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 ${colors[idx].bg}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                {t.benefits.title}
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                {t.benefits.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className={`${benefit.color} rounded-2xl p-8 hover:shadow-xl transition-all group`}>
                  <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className={`w-7 h-7 ${benefit.iconColor} stroke-[2.5]`} />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">{benefit.title}</h3>
                  <p className="text-gray-700 font-semibold">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                {t.reviews.title}
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                {t.reviews.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: `#${review.color}` }}
                    >
                      {review.avatar.split('+')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-black">{review.name}</h4>
                      <p className="text-sm text-gray-500 font-semibold">{review.university}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-semibold">{review.text}</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-violet-500 text-violet-500" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                {t.faq.title}
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                {t.faq.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-bold text-black">{faq.q}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed font-semibold">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-500 via-purple-500 to-violet-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-blue-50 mb-8 font-semibold">
              {t.cta.subtitle}
            </p>
            <button className="px-10 py-5 bg-white text-blue-600 font-extrabold text-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all">
              {t.cta.button}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11  rounded-xl flex items-center justify-center">
                  <img src="/logonur.png" alt="" />
                </div>
                <span className="text-xl font-bold text-white">
                  {t.header.logo}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-semibold">
                {t.footer.description}
              </p>
            </div>

            {/* Menu */}
            <div>
              <h3 className="text-white font-bold mb-4">{t.footer.menu.title}</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-violet-400 transition-colors font-semibold">{t.footer.menu.catalog}</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors font-semibold">{t.footer.menu.about}</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors font-semibold">{t.footer.menu.branches}</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors font-semibold">{t.footer.menu.contacts}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4">{t.footer.contact.title}</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="font-semibold">{t.footer.contact.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold">{t.footer.contact.email}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-semibold">{t.footer.contact.address}</span>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-white font-bold mb-4">{t.footer.social.title}</h3>
              <div className="flex gap-3">
                <a href="#" className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-violet-500 transition-all">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-violet-500 transition-all">
                  <Share2 className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-violet-500 transition-all">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p className="font-semibold">{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
