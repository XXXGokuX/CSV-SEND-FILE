import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OutlinedInput from '@mui/material/OutlinedInput';
import DeleteIcon from '@mui/icons-material/Delete';
import { ButtonBase, IconButton } from '@mui/material';
import Papa from "papaparse";
import { DataGrid } from '@mui/x-data-grid';
import {QRCodeSVG} from 'qrcode.react';
import axios from 'axios';



export default function Upload() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [file,setFile]= React.useState(null)
  const [fileData,setFileData]= React.useState(null)
  const [isSubmit,setIsSubmit]= React.useState(false)
  const [selectedModal,setSelectedModal]= React.useState([])
  const [qrCode,setQrCode]= React.useState(null) 

  const timer = React.useRef();

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      '&:hover': {
        bgcolor: green[700],
      },
    }),
  };
  
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name ", width: 130 },
    { field: "phone", headerName: "Phone Number", width: 130 },
    
  ];
 


  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleButtonClick = () => {
    
    if(isSubmit) return;

    if (!loading && file) {
      setSuccess(false);
      setLoading(true);
      timer.current = window.setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        setIsSubmit(true)
      }, 2000);
    }
    
    if(file)
    Papa.parse(file, {
        header: true,
        skipEmptyLines:true,
        complete: (results) => {
          setFileData({ data: results.data });
          console.log(results.data);
        }
      });
  };

  const uploadFile=() =>{
    if(file) return;
    document.getElementById('csv').click()
  }

  const getFile= (event) =>{
      setFile(event.target.files[0])
  }

  const removeUploadFile =()=>{
    setLoading(false)
    setSuccess(false)
    setFile(null)
    setIsSubmit(false)
    document.getElementById('csv').value= null
  }

  const sendData=async ()=>{
    const csvData= selectedModal.map(index=> {
        return fileData.data.find(item => item.id==index)
    })
    
    console.log(csvData)
    const serverResp = await axios.post('/api/csv',{ csvData })
    
    console.log(serverResp.data);
    setQrCode(serverResp.data)
  }

  



  return (
  <> 
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ m: 1, position: 'relative' }}>
        <input type='file' id="csv" style={{display: "none"}}
        onChange={getFile}
        />  
        <Fab
          aria-label="save"
          color="primary"
          sx={buttonSx}
          onClick={uploadFile}
        >
          {success ? <CheckIcon /> : <CloudUploadIcon />}
        </Fab>
  
          

        {loading && (
          <CircularProgress
            size={68}
            sx={{
              color: green[500],
              position: 'absolute',
              top: -6,
              left: -6,
              zIndex: 1,
            }}
          />
        )}
      </Box>
      <Box sx={{ m: 1, position: 'relative' }}>
        <Button
          variant="contained"
          sx={buttonSx}
          disabled={loading}
          onClick={handleButtonClick}
        >
          {file ? file.name : "Upload File"}
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: green[500],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
      
        <IconButton onClick={removeUploadFile}>
          <DeleteIcon/>
        </IconButton>
    </Box>
    {fileData && 
    <>
    <div style={{ height: 400, width: '100%' }}>
    <DataGrid
      rows={fileData.data}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[5]}
      checkboxSelection
      rowSelectionModel= {selectedModal}
      onRowSelectionModelChange= {(newModal)=> setSelectedModal(newModal)}
    />
  </div>
    
    
    <Button variant="contained" sx={{ mt:"20px" }} onClick={sendData}>
        SUBMIT
    </Button>
    </>
   }

    {qrCode &&
     <Box sx={{
      mt:"20px",
      "& svg":{
       width: "300px",
       height: "300px"
      }
      }}>
         <QRCodeSVG value= {qrCode} />,
     </Box>
    }
  </>
  );
}