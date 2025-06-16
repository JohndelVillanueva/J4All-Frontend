import React from "react";

const ProfileTab: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Profile</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Senior Frontend Developer Profile
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">About</h4>
            <p className="text-gray-600">
              Experienced Senior Frontend Developer with 7+ years building responsive,
              accessible web applications. Specialized in React, TypeScript, and modern
              JavaScript frameworks. Passionate about creating intuitive user experiences
              and mentoring junior developers.
            </p>
          </div>
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "React",
                "TypeScript",
                "Redux",
                "GraphQL",
                "Next.js",
                "Jest",
                "Cypress",
                "Node.js",
                "Webpack",
                "Sass",
              ].map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Experience</h4>
              <ul className="space-y-4">
                <li>
                  <h5 className="font-medium">Lead Frontend Developer</h5>
                  <p className="text-sm text-gray-600">TechCorp • 2019 - Present</p>
                </li>
                <li>
                  <h5 className="font-medium">Senior UI Developer</h5>
                  <p className="text-sm text-gray-600">WebSolutions • 2016 - 2019</p>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Education</h4>
              <ul className="space-y-4">
                <li>
                  <h5 className="font-medium">MSc Computer Science</h5>
                  <p className="text-sm text-gray-600">State University • 2015</p>
                </li>
                <li>
                  <h5 className="font-medium">BSc Software Engineering</h5>
                  <p className="text-sm text-gray-600">State University • 2013</p>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;