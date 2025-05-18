import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenCheck, Sparkles, ArrowRight, Award, GraduationCap } from 'lucide-react';
import { useModules } from '../../hooks/useModules';

const WelcomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { modules } = useModules();

  useEffect(() => {
    // Имитируем загрузку данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 animate-fade-in">
        <div className="w-16 h-16 mb-4 rounded-full bg-primary-900/30 flex items-center justify-center animate-pulse shadow-glow-primary">
          <Sparkles className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
        <p className="text-neutral-400 font-medium animate-pulse">Yuklanmoqda...</p>
      </div>
    );
  }

  const firstModuleId = modules.length > 0 ? modules[0].id : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r from-primary-900 to-accent-900 p-8 shadow-neon-multi border border-primary-700/30">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M42.8,-73.2C54.9,-67.7,63.6,-54.8,69.7,-41.2C75.8,-27.7,79.3,-13.8,79.2,-0.1C79.1,13.7,75.3,27.3,68.3,39.5C61.3,51.7,51.1,62.3,38.8,69.1C26.6,75.9,13.3,78.8,-0.5,79.6C-14.3,80.4,-28.5,79.1,-40.3,72.4C-52.1,65.7,-61.4,53.6,-68.8,40.3C-76.2,27,-81.6,13.5,-81.9,-0.2C-82.2,-13.8,-77.4,-27.6,-69.4,-39.1C-61.3,-50.6,-50,-59.8,-37.5,-64.9C-25,-70,-12.5,-71,1.1,-72.9C14.7,-74.8,29.3,-77.5,42.8,-73.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="flex items-center space-x-5 relative z-10 mb-6">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-neon-primary border border-white/20">
            <BookOpenCheck className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white font-display drop-shadow-md">Dressline</h1>
            <div className="flex items-center mt-2 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 inline-block">
              <Sparkles className="h-4 w-4 mr-2 text-white" />
              <span className="text-white font-medium">Elektron kitobga xush kelibsiz!</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Левая колонка с фото и информацией */}
          <div className="w-full md:w-64 flex flex-col">
            <div className="relative z-10 bg-neutral-900 rounded-xl border-2 border-primary-600/30 shadow-neon-primary overflow-hidden">
              <img 
                src="/images/muxidova.png" 
                alt="Muxidova Olima Nurilloyevna" 
                className="w-full object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold text-white mb-3">Muxidova Olima Nurilloyevna</h3>
                <div className="flex items-center text-primary-300 mb-2 justify-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span className="text-sm"></span>
                </div>
                <div className="flex items-center text-primary-300 justify-center">
                  <Award className="h-4 w-4 mr-2" />
                  <span className="text-sm"></span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Правая колонка с биографией */}
          <div className="flex-1 relative z-10 p-5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20 shadow-lg text-white">
            <div className="text-white/90 text-sm leading-normal">
              <p className="mb-2">
                Muxidova Olima Nurilloyevna 1974 yil 13 iyunda Buxoro shahrida tavallud topgan. 1996 yilda Buxoro Oziq-ovqat va yengil sanoat texnologiya institutining Tikuvchilik mahsulotlari texnologiyasi va konstruksiyasi mutaxassisligini tugatgan.
              </p>
              
              <p className="mb-2">
                1996-1998 yilda Buxoro industrial pedagogika texnikumi tikuvchilik texnologiyasi fani o'qituvchisi, 1998-2004 yilda Buxoro pedagogika texnikumi tikuvchilik texnologiyasi fani o'qituvchisi, 2005-2010 yilda Buxoro pedagogika kolleji tikuvchilik texnologiyasi fani o'qituvchisi, 2010-2019 yilda Buxoro pedagogika kolleji "Maktabdan va sinfdan tashqari tarbiyaviy ishlar" kafedrasi mudiri, 2019-2020 yilda Buxoro davlat universiteti "Mehnat ta'limi" kafedrasi o'qituvchisi, 2020 yil sentyabrdan 2023 yilgacha "Elektronika va texnologiya" kafedrasi katta o'qituvchisi lavozimida faoliyat yuritib kelgan.
              </p>
              
              <p className="mb-2">
                2023-2025 yilda Qori Niyoziy nomidagi Tarbiya pedagogikasi milliy institutining tayanch doktoranti. O.N.Muxidova 2023 yildan pedagogika fanlari doktori (DSc), professor Sh.Q.Mardonov rahbarligida "Bo'lajak texnologiya o'qituvchilarining transversal kompetensiyalarini rivojlantirishda elektron dasturlashdan foydalanish metodikasini takomillashtirish" mavzusida o'zining ilmiy tadqiqot ishlarini olib bormoqda.
              </p>
              
              <p className="mb-2">
                U o'z ilmiy faoliyati davrida 50 ga yaqin maqola va tezislar chop ettirgan. Jumladan: Scopus xalqaro ma'lumotlar bazasiga kiritilgan jurnallarda 1 ta Web off science 20 xalqaro ma'lumotlar bazasiga kiritilgan jurnallarda 2 ta, OAK ro'yxatidagi respublika va xalqaro jurnallarda 20 dan ortiq, shuningdek, respublika va xalqaro konferensiya materiallari to'plamlarida 20 dan ortiq ilmiy tadqiqot natijalarini e'lon qilgan.
              </p>
              
              <p>
                Undan tashqari yakka va hammualliflikda o'quv va uslubiy qo'llanmalari nashr etilgan.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex">
          {firstModuleId ? (
            <NavLink 
              to={`/module/${firstModuleId}`}
              className="btn btn-gradient px-6 py-3 text-white rounded-xl hover:shadow-neon-multi transition-all duration-300 flex items-center gap-2 font-medium"
            >
              Boshlash
              <ArrowRight className="h-5 w-5" />
            </NavLink>
          ) : (
            <NavLink 
              to="/contents"
              className="btn btn-gradient px-6 py-3 text-white rounded-xl hover:shadow-neon-multi transition-all duration-300 flex items-center gap-2 font-medium"
            >
              Mundarija
              <ArrowRight className="h-5 w-5" />
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;