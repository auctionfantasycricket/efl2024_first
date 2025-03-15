import React from 'react'
import { NavBar } from '../components/NavBar';
import { Banner } from '../components/Banner';
import {Carousels} from '../components/Carousels';
import {Contactus} from '../components/Contactus';
import { Rules } from '../components/Rules';
import { Footer } from '../components/Footer';

const HomePage = () => {
  return (
    <div>
        <Banner/>
        {/* <Carousels />
        <Rules />
        <Contactus /> */}
        <Rules />
        <Footer />
     
    </div>
  )
}

export default HomePage

/*   */