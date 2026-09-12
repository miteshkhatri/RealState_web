import React, { useEffect, useState } from 'react'
import Userlist from './userlist'
import axios from 'axios'
import { API_BASE_URL } from 'config/constant'
import api from 'utils/api'
import ThemeLoader from 'components/Loader/ThemeLoader'

function index() {
  const [data , setData] = useState()
  const userData = JSON.parse(localStorage.getItem('users'))
  const columns = ['#', 'Profile' ,'Name', 'Mobile no', 'Email',   'Role', 'Date' , 'Action'];
  const getAllUsers = async()=>{
    try {
      const res = await api.get(`/user`,{
        headers:{
          Authorization:userData.user_token
        }
      })
      if(res.data.success == true){
        setData(res.data.data)
      }
       
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{
    getAllUsers()
  },[])

  if (!data) {
    return <ThemeLoader />
  }

  return (
    <>
    
    <Userlist data={data} columns={columns} getAllUsers={getAllUsers} />
    </>
    
     
  )
}

export default index
