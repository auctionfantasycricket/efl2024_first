import React, { useState, useEffect } from 'react';
import './WaiverSystem.css';
import { useQuery } from '@tanstack/react-query';
import { Select, Table } from 'antd';
import { useSelector } from 'react-redux';
import { encryptData,decryptData } from '../components/Encryption';
import { Container, Row, Col } from 'react-bootstrap';
import waiver_results from '../assets/images/waiver_results.gif'


const baseURL = process.env.REACT_APP_BASE_URL;

const fetchPlayerslist = async () => {
  const response = await fetch(baseURL+'/get_data?collectionName=eflDraft_playersCentral');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const fetchTeamInfo = async (useremail) => {
  const response = await fetch(`${baseURL}/getTeamOwnerByEmail/${useremail}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team info');
  }
  return response.json();
};

const getwaiverresults = async () => {
  const response = await fetch(baseURL+'/get_data?collectionName=global_data');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export const WaiverSystem = () => {
  const [preferences, setPreferences] = useState(['', '', '', '']);
  const [encryptpreferences, setEncryptPreferences] = useState(['', '', '', '']);
  const [drops, setDrops] = useState(['', '']);
  const [encryptdrops, setEncryptDrops] = useState(['', '']);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [unsoldPlayers, setUnSoldPlayers] = useState([]);
  const [Teamswaiver, setTeamswaiver] = useState([])
  const [lastupdatedby, setLastupdatedby] = useState('')
  const [lastupdatedat, setLastupdatedat] = useState('')
  const [allglobaldata, setAllGlobalData] = useState([]);
  const [waiverresults, setWaiverResults] = useState([]);
  const [showSubmitbutton, setshowSubmitbutton] = useState(false);
 
  const userProfile = useSelector((state) => state.login.userProfile);
  const useremail = userProfile ? userProfile.email : '';
  //const useremail ="saksharhere@gmail.com"

  const playoffteams = ['Afghanistan','Australia','Bangladesh','England','India','South-africa','United-states-of-america','West-indies']
  

  const { isLoading, error, data } = useQuery({queryKey:['players'], queryFn:fetchPlayerslist});

  useEffect(() => {
    if (data) {
      setUnSoldPlayers(data.filter((item) => item.status !== 'sold' && playoffteams.includes(item.country)));
      setSoldPlayers(data.filter((item) => item.status === 'sold'));
    }
  }, [data]); 

  /*
  useEffect(() => {
    async function getteaminfo() {
      try {
        const response = await fetch(`${baseURL}/getTeamOwnerByEmail/${useremail}`);
        if (response.ok) {
          const stats = await response.json();
          setTeamswaiver(stats);
          handledecrypt(stats.currentWaiver.in, "pref");
          handledecrypt(stats.currentWaiver.out, "drop");
          setLastupdatedby(stats.currentWaiver.lastUpdatedBy)
          setLastupdatedat(stats.currentWaiver.lastUpdatedTime)
        } else {
          console.log('Error: ' + response.status + response.body);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (useremail) {
      getteaminfo();
    }
  }, [useremail]);*/

  useEffect(() => {
    if (useremail) {
      getTeamInfo(useremail);
    }
  }, [useremail]);

  const getTeamInfo = async (email) => {
    try {
      const stats = await fetchTeamInfo(email);
      setTeamswaiver(stats);
      handledecrypt(stats.currentWaiver.in, "pref");
      handledecrypt(stats.currentWaiver.out, "drop");
      setLastupdatedby(stats.currentWaiver.lastUpdatedBy);
      setLastupdatedat(stats.currentWaiver.lastUpdatedTime);
    } catch (error) {
      console.error(error);
    }
  };


  const handledecrypt = (val, opt) => {
    if (opt === "pref") {
      const newPreferences = val.map(item => decryptData(item));
      setEncryptPreferences(val)
      setPreferences(newPreferences);
    } else if (opt === "drop") {
      const newDrops = val.map(item => decryptData(item));
      setDrops(newDrops);
      setEncryptDrops(val);
    }
  };

  const { isLoading: isLoadingWR, error: errorWR, data: waivers } = useQuery({ queryKey: ['timestamp'], queryFn: getwaiverresults });

  //console.log("NOP",waivers)

  useEffect(() => {
    if (waivers && waivers.length > 0) {
      setWaiverResults(waivers[0].waiverResults);
    }
  }, [waivers]);


  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop:'250px' }}>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (Teamswaiver.length === 0) return <div>Loading teams data...</div>;

  const transformedunsoldPlayers = unsoldPlayers.map(unsoldPlayers => ({
    value: unsoldPlayers.player_name,
    label: unsoldPlayers.player_name
  }));

  const teamname = Teamswaiver.teamName
  const teamplayers = soldPlayers.filter((item) => item.ownerTeam === teamname)
  const transformedsoldPlayers = teamplayers.map(teamplayers => ({
    value: teamplayers.player_name,
    label: teamplayers.player_name
  }));


  const handlePreferenceChange = (index, value) => {
    const newPreferences = [...preferences];
    const newEncryptPreferences = [...encryptpreferences]
    const encryptedprefvalue = encryptData(value)
    newPreferences[index] = value;
    newEncryptPreferences[index] = encryptedprefvalue
    setEncryptPreferences(newEncryptPreferences)
    setPreferences(newPreferences);
  };

  const handleDropChange = (index, value) => {
    if (drops.includes(value)) {
      alert('This player is already selected for drop. Please choose a different player.');
    }
    const newDrops = [...drops];
    const newEncryptedDrops = [...encryptdrops];
    const encrypteddropvalue = encryptData(value)
    newDrops[index] = value;
    newEncryptedDrops[index] = encrypteddropvalue;
    setDrops(newDrops);
    setEncryptDrops(newEncryptedDrops)
  };

  const handleSubmit = () => {
    const uniquedrops = new Set(drops)
    if (uniquedrops.size !== drops.length){
      alert('You cant drop sameplayer for both picks');
      return;
    }
    const payload = {  "currentWaiver": {
      "in": encryptpreferences,
      "out": encryptdrops
    } };
    
    fetch(`${baseURL}/updateCurrentWaiver/${useremail}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });

    alert('Your waivers saved successfully!!The selection will be locked on Tuesday at 8:59 pm');
    getTeamInfo(useremail);
  };

  const handleclear = (index, opt) =>{
    if (opt==="pref"){
      const newPreferences = [...preferences];
      newPreferences[index] = '';
      const newEncryptPreferences = [...encryptpreferences] 
      newEncryptPreferences[index] = '';
      setPreferences(newPreferences);
      setEncryptPreferences(newEncryptPreferences);
    }else if(opt === "drop"){
      const newDrops = [...drops];
      const newEncryptedDrops = [...encryptdrops];
      newDrops[index] = '';
      newEncryptedDrops[index] = '';
      setDrops(newDrops);
      setEncryptDrops(newEncryptedDrops)
    }
  }

  const transformedData = waiverresults.flatMap(entry => 
    entry.picks.map((pick, index) => ({
      key: `${entry.pref}-${index}`,
      pref: entry.pref,
      pick,
      result: entry.result[index],
      reason: entry.reason[index]
    }))
  );
  
  const columns = [
    {
      title: 'Preference',
      dataIndex: 'pref',
      key: 'preference',
    },
    {
      title: 'Pick',
      dataIndex: 'pick',
      key: 'pick',
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
  ];


  return (
    <div className="waiverpage">
    <div className="waiversystem">
      <h1>Waivers for {teamname}</h1>
      <Row className="tablecontainer">
        <Col className="main-content">
      <div className="preference-section">
        <h2>Preferences</h2>
        {preferences.map((preference, index) => (
          <div key={index} className="preference-input">
            <label>Preference {index + 1}</label>
            <Select
              showSearch
              allowClear="true"
              style={{width:300,minHeight:40,border:"1px solid black",borderRadius:"5px",color:"black"}}
              placeholder={preference?preference:"Search Player to Select"}
              optionFilterProp="children"
              onClear={() => handleclear(index,"pref")}
              onChange={(value) => handlePreferenceChange(index, value)}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              filterSort={(optionA, optionB) =>
              (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
              options={transformedunsoldPlayers}
            />
          </div>
        ))}
      </div>
      </Col>
      <Col className="sidebar">
      <div className="drop-section">
        <h2>Drops</h2>
          {drops.map((drop, index) => (
            <div key={index} className="drop-input">
              <label>Drop {index + 1}</label>
              <Select
                placeholder={drop?drop:"Search Player to drop"}
                allowClear="true"
                style={{width:300,minHeight:40,border:"1px solid black",borderRadius:"5px",color:"black"}}
                optionFilterProp="children"
                onClear={() => handleclear(index,"drop")}
                onChange={(value) => handleDropChange(index, value)}
                options ={transformedsoldPlayers}
              />
            </div>
          ))}
      </div>
      {showSubmitbutton && <button onClick={handleSubmit}>Submit</button>}
      <div>
      {lastupdatedby && <h3>Last updated by {lastupdatedby}</h3>}
      {lastupdatedat && <h4>Last updated at {lastupdatedat}</h4>}
      </div>
      </Col>
      <Col className="logbar">
      <div className='waiver-results'>
        <h2>Results</h2>

        <Table 
          dataSource={transformedData} 
          columns={columns}
          pagination={{ pageSize: 6 }}
          bordered
          size='small'
        />;
      </div>
      <div className="gif-container">
      <img src={waiver_results} alt="Example GIF" className="gif" />
    </div>
      </Col>
      </Row>
    </div>
    </div>
  );
};
