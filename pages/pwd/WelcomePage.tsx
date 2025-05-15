const PWDWelcomePage = () => {
    return ( 
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Pwd Page</h1>
            <p className="text-lg mb-8">PWD</p>
            <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded">PWD</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded">PWD</button>
            </div>
        </div>
     );
}
 
export default PWDWelcomePage;