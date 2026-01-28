import AuctionSection from "../components/layout/Auctions";
import { CheckCircle } from "lucide-react";
import register from "../assets/images/bg1.jpg"
import tetFlowerRed from "../assets/images/tet-flower-red.svg";
import tetFlowerYellow from "../assets/images/tet-flower-yellow.svg";
import tetFireworksLeft from "../assets/images/tet-fireworks-left.svg";
import tetFireworksRight from "../assets/images/tet-fireworks-right.svg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AnimatedText from "../common/AnimatedText";
import { useTetMode } from "../contexts/TetModeContext";
import FallingFlowers from "../common/FallingFlowers";

function HomePage() {
  const { t } = useTranslation();
  const { tetMode } = useTetMode();
  return (
    <main 
      className="relative shadow-[0_4px_24px_rgba(0,0,0,0.30)] mt-[160px] p-4 sm:mt-[160px] lg:mt-[100px] md:mt-[170px] rounded-xl overflow-hidden transition-colors duration-500"
      style={tetMode ? { backgroundColor: '#18191a' } : {}}
    >
      {/* Falling Flowers Effect for Tet Mode */}
      {tetMode && <FallingFlowers />}
      
      <section className="relative w-full  h-[630px] flex items-center justify-center text-center mb-[35px]">
      {/* Background Image */}
      <img
        src={register}
        alt="Auction"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Tet Fireworks Decorations */}
      {tetMode && (
        <>
          <img 
            src={tetFireworksLeft} 
            alt="Fireworks Left" 
            className="absolute top-0 left-0 w-8 md:w-8 lg:w-16 h-auto object-contain pointer-events-none z-10"
          />
          <img 
            src={tetFireworksRight} 
            alt="Fireworks Right" 
            className="absolute top-0 right-0 w-12 md:w-12 lg:w-24 h-auto object-contain pointer-events-none z-10"
          />
        </>
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <AnimatedText>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* Subtitle */}
        <p className="text-white text-sm p-2 tracking-widest mb-3">
          {t("probid")}
        </p>
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          {t("select")} <span className="italic font-playfair text-[#ffffffa4]">{t("our_product")}</span>
          <br />
          {t("at_our_auction")}
        </h1>

        {/* Features */}
        <div className="flex justify-center items-center gap-6 mt-6 flex-wrap">
          <div className="flex items-center gap-2 text-white">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span>{t("auction_excellence")}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span>{t("moneyback_guarantee")}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span>{t("support_24_7")}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link to="/guide" className="relative group">
            {tetMode && (
              <>
                <img 
                  src={tetFlowerRed} 
                  alt="Tet Flower" 
                  className="absolute -top-3 -left-3 w-8 h-8 object-contain pointer-events-none z-10 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12"
                />
                <img 
                  src={tetFlowerYellow} 
                  alt="Tet Flower" 
                  className="absolute -bottom-3 -right-3 w-8 h-8 object-contain pointer-events-none z-10 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12"
                />
              </>
            )}
            <button className={`px-6 py-3 flex items-center transition-all transform duration-300 hover:scale-105 will-change-transform text-white font-semibold rounded-sm shadow-lg ${tetMode ? 'bg-gradient-to-r from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
              {t("start_a_bid")}
              <span className="ml-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 4.5 15 15m0 0V8.25m0 11.25H8.25" />
              </svg></span>
            </button>
          </Link>
          <Link to="/auctions/search" className="relative group">
            {tetMode && (
              <>
                <img 
                  src={tetFlowerRed} 
                  alt="Tet Flower" 
                  className="absolute -top-3 -left-3 w-8 h-8 object-contain pointer-events-none z-10 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12"
                />
                <img 
                  src={tetFlowerYellow} 
                  alt="Tet Flower" 
                  className="absolute -bottom-3 -right-3 w-8 h-8 object-contain pointer-events-none z-10 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12"
                />
              </>
            )}
            <button className={`px-6 py-3 transition-all transform duration-300 hover:scale-105 will-change-transform font-semibold rounded-sm shadow-lg ${tetMode ? 'bg-[#fbbf24] text-[#18191a]' : 'bg-white text-black'}`}>
              {t("view_all_auction")}
            </button>
          </Link>
        </div>
      </div>
      </AnimatedText>
    </section>
      <AuctionSection  titleKey="ongoing_auctions" type="ongoing" />
      <hr />
      <AuctionSection titleKey="upcoming_auctions" type="upcoming" />
      <hr />
      <AuctionSection titleKey="ended_auctions" type="ended" />
    </main>
  );
}

export default HomePage;
