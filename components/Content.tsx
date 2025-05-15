import { useNavigate } from 'react-router-dom';

type LabelType = 
  | 'PWD' 
  | 'Indigenous People' 
  | 'Admin' 
  | 'Company'
  | 'Students'
  | 'Seniors'
  | 'Healthcare'
  | 'Education';

const Content = () => {
  const navigate = useNavigate();

  const handleCardClick = (label: LabelType) => {
    navigate(`/${label.toLowerCase().replace(' ', '-')}`);
  };

  const handleFindJobClick = () => {
    navigate('/find-job');
  };

  const cardData: { label: LabelType; subtitle: string; color: string; hoverClass: string }[] = [
    { label: 'PWD', subtitle: 'Persons with Disabilities', color: 'blue', hoverClass: 'hover:bg-blue-50' },
    { label: 'Indigenous People', subtitle: 'Native communities', color: 'green', hoverClass: 'hover:bg-green-50' },
    { label: 'Admin', subtitle: 'Administrator access', color: 'purple', hoverClass: 'hover:bg-purple-50' },
    { label: 'Company', subtitle: 'Corporate accounts', color: 'orange', hoverClass: 'hover:bg-orange-50' },
    { label: 'Students', subtitle: 'Educational resources', color: 'indigo', hoverClass: 'hover:bg-indigo-50' },
    { label: 'Seniors', subtitle: 'Elderly support', color: 'pink', hoverClass: 'hover:bg-pink-50' },
    { label: 'Healthcare', subtitle: 'Medical professionals', color: 'red', hoverClass: 'hover:bg-red-50' },
    { label: 'Education', subtitle: 'Schools & universities', color: 'emerald', hoverClass: 'hover:bg-emerald-50' }
  ];

  return (
    <div className="mx-auto px-8 my-2 mt-20">
      <div className="mx-auto">
        <div className="mx-4">
          <div className="mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
              <button 
                onClick={handleFindJobClick}
                className="bg-blue-700 hover:bg-red-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
              >
                Find Job
              </button>
            </div>
            <p className="mt-2">Select a Card to view more details</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {cardData.map((card) => (
                <div 
                  key={card.label}
                  onClick={() => handleCardClick(card.label)}
                  className={`flex flex-col h-35 w-full bg-white rounded-lg shadow-md p-6 cursor-pointer ${card.hoverClass} transition-colors border border-${card.color}-200`}
                >
                  <div className="flex-grow">
                    <h2 className={`text-xl font-semibold text-center text-${card.color}-800`}>
                      {card.label}
                    </h2>
                    <p className="text-gray-600 mt-1 text-center">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className={`mt-2 text-center text-sm text-${card.color}-600`}>
                    Click to view page →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;