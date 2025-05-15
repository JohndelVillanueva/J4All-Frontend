import SubHeader from "../../components/SubHeader";
// import React from "react";
const IndigenousPeople = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center w-full h-16 bg-gray-200 dark:bg-gray-800">
        <SubHeader pageTitle="Indigenous People" />
      </div>

      <div className="flex flex-col items-center h-screen  overflow-hidden mt-10">
        <h1 className="text-4xl font-bold mb-4">Indigenous People</h1>
        <p className="text-lg text-center max-w-2xl px-4">
          Indigenous peoples are the original inhabitants of a region, with
          distinct cultures, languages, and traditions. They have a deep
          connection to their ancestral lands and often face challenges related
          to land rights, cultural preservation, and social justice.
        </p>
      </div>
    </div>
  );
};

export default IndigenousPeople;
