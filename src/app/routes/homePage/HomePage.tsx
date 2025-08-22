// HomePage.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import Hero from './Hero'
import AboutHome from './AboutHome'
import Brands from './Brands'
 
import MarketPage from './MarketPage'
import Properties from './Properties'
import WhatMakeUs from './WhatMakeUs'
import Teams from './Teams'
import Testimonial from './Testimonial'
import WorkWithUs from './WorkWithUs'
import InrextVIP from '../InrextVIP/InrextVIP'

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className=''>
    <Hero />
    <AboutHome/>
    <Brands/>
    {/* <MarketOverview/> */}
    <MarketPage/>
    <Properties/>
    <WhatMakeUs/>
    {/* <Teams/> */}
    <InrextVIP/>
    <Testimonial/>
    <WorkWithUs/>
    </div>
  )
}

export default HomePage

