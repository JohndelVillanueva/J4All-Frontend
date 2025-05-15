import SubHeader from "../../components/SubHeader";
const PwdPeople = () => {
    const people = [
        {
            id: 1,
            fullName: "John Doe",
            age: 32,
            email: "john.doe@example.com",
            image: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
            id: 2,
            fullName: "Jane Smith",
            age: 28,
            email: "jane.smith@example.com",
            image: "https://randomuser.me/api/portraits/women/1.jpg"
        },
        {
            id: 3,
            fullName: "Robert Johnson",
            age: 45,
            email: "robert.j@example.com",
            image: "https://randomuser.me/api/portraits/men/2.jpg"
        },
        {
            id: 4,
            fullName: "Emily Davis",
            age: 30,
            email: "emily.d@example.com",
            image: "https://randomuser.me/api/portraits/women/2.jpg"
        }
    ];

    const handleCardClick = (personId) => {
        // You can replace this with your desired action
        console.log(`Card clicked for person with ID: ${personId}`);
        alert(`You clicked on ${people.find(p => p.id === personId).fullName}`);
    };

    return (
        <div>
        <div className="flex flex-col items-center justify-center w-full h-16 bg-gray-200 dark:bg-gray-800">
        <SubHeader pageTitle="People With Disability" />
      </div> 
        <div className="flex flex-col items-center min-h-screen p-4">
            <h1 className="text-4xl font-bold mb-4">PWD People</h1>
            <p className="text-lg text-gray-700 mb-8">This is the PWD People page.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {people.map(person => (
                    <div 
                        key={person.id} 
                        onClick={() => handleCardClick(person.id)}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:-translate-y-1 transition-transform"
                    >
                        <img 
                            src={person.image} 
                            alt={person.fullName}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image";
                            }}
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{person.fullName}</h2>
                            <p className="text-gray-600 mb-1"><span className="font-medium">Age:</span> {person.age}</p>
                            <p className="text-gray-600 truncate"><span className="font-medium">Email:</span> {person.email}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
}
 
export default PwdPeople;