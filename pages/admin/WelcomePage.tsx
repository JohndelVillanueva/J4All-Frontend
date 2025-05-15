import { useNavigate } from 'react-router-dom';

type LabelType = 
  | 'PWD' 
  | 'Indigenous People' 
  | 'Admin' 
  | 'Company';

const AdminWelcomePage = () => {
  const navigate = useNavigate();

  const handleCardClick = (label: LabelType) => {
    navigate(`/${label.toLowerCase().replace(' ', '-')}`);
  };

  // const handleFindJobClick = () => {
  //   navigate('/find-job');
  // };

  const cardData: { label: LabelType; subtitle: string; color: string; hoverClass: string }[] = [
    { label: 'PWD', subtitle: 'Persons with Disabilities', color: 'blue', hoverClass: 'hover:bg-blue-50' },
    { label: 'Indigenous People', subtitle: 'Native communities', color: 'green', hoverClass: 'hover:bg-green-50' },
    { label: 'Admin', subtitle: 'Administrator access', color: 'purple', hoverClass: 'hover:bg-purple-50' },
    { label: 'Company', subtitle: 'Corporate accounts', color: 'orange', hoverClass: 'hover:bg-orange-50' }
  ];

  return (
    <div className="mx-auto px-8 my-2 mt-20">
      <div className="mx-auto">
        <div className="mx-4">
          <div className="mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
              {/* <button 
                onClick={handleFindJobClick}
                className="bg-blue-700 hover:bg-red-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
              >
                Find Job
              </button> */}
            </div>
            <p className="mt-2">Select a Card to view more details</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
              {cardData.map((card) => (
                <div 
                  key={card.label}
                  onClick={() => handleCardClick(card.label)}
                  className={`group flex flex-col h-40 w-full bg-white rounded-lg shadow-md cursor-pointer ${card.hoverClass} transition-all duration-300 overflow-hidden relative`}
                >
                  <div className="flex-grow p-6">
                    <h2 className={`text-xl font-semibold text-center ${
                      card.color === 'blue' ? 'text-blue-800' :
                      card.color === 'green' ? 'text-green-800' :
                      card.color === 'purple' ? 'text-purple-800' :
                      'text-orange-800'
                    }`}>
                      {card.label}
                    </h2>
                    <p className="text-gray-600 mt-1 text-center">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className={`mt-2 text-center text-sm ${
                    card.color === 'blue' ? 'text-blue-600' :
                    card.color === 'green' ? 'text-green-600' :
                    card.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  } pb-2`}>
                    Click to view page →
                  </div>
                  {/* Decorative bottom bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                    card.color === 'blue' ? 'bg-blue-500' :
                    card.color === 'green' ? 'bg-green-500' :
                    card.color === 'purple' ? 'bg-purple-500' :
                    'bg-orange-500'
                  } transition-all duration-300 group-hover:h-2`}></div>
                  {/* Optional corner accent */}
                  <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${
                    card.color === 'blue' ? 'border-blue-500' :
                    card.color === 'green' ? 'border-green-500' :
                    card.color === 'purple' ? 'border-purple-500' :
                    'border-orange-500'
                  } opacity-50`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcomePage; 