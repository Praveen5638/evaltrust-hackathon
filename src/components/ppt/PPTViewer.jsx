import React from 'react';

const PDFViewer = ({ file_url }) => {
  if (!file_url) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No PDF URL provided</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
      <iframe
        src={`${file_url}#toolbar=0`}
        title="PDF Viewer"
        className="w-full h-[600px] border-0"
        allowFullScreen
      />
    </div>
  );
};

export default PDFViewer;