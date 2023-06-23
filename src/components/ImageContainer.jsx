import React from 'react';

import image1 from './sculpture-images/1.png';
import image2 from './sculpture-images/2.png';
import image3 from './sculpture-images/3.png';
import image4 from './sculpture-images/4.png';
import image5 from './sculpture-images/5.png';
import image6 from './sculpture-images/0.png';

const images = [image1, image2, image3, image4, image5, image6];

const ImageContainer = () => {
  return (
    <div className="image-container">
      {images.map((image, index) => (
        <img 
        src={image} 
        alt={`Image ${index + 1}`} 
        key={index}
        />
      ))}
    </div>
  );
};

export default ImageContainer;
