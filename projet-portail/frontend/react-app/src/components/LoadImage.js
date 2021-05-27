import React, { useState } from 'react';
import axios from 'axios';
import { Ripple } from 'react-spinners-css';
import './styles.css';

function LoadImage(){
    const [imgPreview, setImgPreview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [breed, setBreed] = useState(null);
    const [animal, setAnimal] = useState(null);
    const [type, setType] = useState(null);

    const handleImageChange = (e) => {
        setError(false);
        setLoading(true);
        const selected = e.target.files[0];
        const allowed_types = ["image/png", "image/jpeg", "image/jpg"];
        if(selected && allowed_types.includes(selected.type)){
            let reader = new FileReader();
            let data = new FormData();
            reader.onloadend = () => {
                setImgPreview(reader.result);
            }
            reader.readAsDataURL(selected);
            data.append('file', selected);
            data.append('filename', selected.name);
            axios.post('http://127.0.0.1:5000/detect', data, {
                headers: {
                        'content-type': 'multipart/form-data'
                    }
                })
                .then( (response) => {
                    console.log(response.data);
                    setLoading(false);
                    let data = response.data
                    if (data.status === 1){
                        setAnimal(true);
                        setType('dog');
                        setBreed(data.msg);
                    }
                    else if(data.status === 0){
                        setType('cat');
                        setAnimal(true);
                        setBreed(data.msg);
                    }
                    else{
                        setAnimal(false);
                        setBreed(data.msg);
                    }

                }, (err) => {
                    console.log(err);
                });
            
        } else {
            setError(true);
        }
    }
    
    return(
        <div className="App">
            <div className="container">
                {error && <p className="errorMsg">File not supported</p>}
            </div>
            <div 
            className="imgPreview"
            style={{
                background: imgPreview 
                    ? `url("${imgPreview}") no-repeat center/cover`
                    : "#131313"
                }}
            >
                {!imgPreview && (
                <>
                    <p>Add an image</p>
                    <label htmlFor="fileUpload" className="customFileUpload">
                        Choose file
                    </label>
                    <input type="file" id="fileUpload" onChange={handleImageChange}></input>
                    <span>jpg, jpeg or png</span>
                </>
                )}
            </div>
            {imgPreview && (
                <>
                {loading === true ? (
                    <Ripple color="#be97e8" size={65}/>
                ) : (
                    <div className="imgResult">
                        <>
                        {animal === true ? (<div>
                            AI thinks it's a {breed} {type}
                        </div>) 
                        : (
                            <div>
                                Please upaload another photo
                            </div>
                        )} 
                        </>
                    </div>
                )}
                <button onClick={() => setImgPreview(null)}>Remove image</button>
            </>
            )}
        </div>
    )
}

export default LoadImage;