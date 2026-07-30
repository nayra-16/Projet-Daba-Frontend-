import React from 'react';
 
type AppelOffre = {
  title: string;
  description: string;
  date: string;
};
 
const AppelsOffres: React.FC = () => {
  const appels: AppelOffre[] = [];
 
  return (
    <div className="bg-brand-light min-h-screen pb-20">
      <section className="bg-brand-blue py-16 text-white mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-white">Appels d’offres</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Consultez les appels d’offres disponibles et les modalités de participation.
          </p>
        </div>
      </section>
 
      <div className="container mx-auto px-4">
        {appels.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-2">Aucun appel d’offre pour le moment</h2>
            <p className="text-gray-600">
              Revenez plus tard pour découvrir les prochaines opportunités.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appels.map((a) => (
              <div
                key={`${a.title}-${a.date}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="text-sm text-gray-500 mb-2">{a.date}</div>
                <div className="text-xl font-bold text-brand-blue mb-2">{a.title}</div>
                <div className="text-gray-600">{a.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default AppelsOffres;
