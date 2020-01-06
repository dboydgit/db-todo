import React, { useEffect, useState } from 'react';
import './Login.css';
import Header from './Header';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' ?
    'http://localhost:4000' :
    'https://db-todo.duckdns.org/api';

export default function Login(props) {

    const blankForm = {
        name: '',
        email: '',
        password: '',
        passwordRpt: ''
    };
    const validEmailRegex = RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);

    useEffect(() => {
        document.title = 'Todo-SignUp'
    }, []);

    const [form, setForm] = useState(blankForm);
    const [errors, setErrors] = useState(blankForm);
    const [serverErr, setServerErr] = useState('');

    let history = useHistory();

    const handleInputChange = (event) => {
        let value = event.target.value;
        setForm({
            ...form,
            [event.target.name]: value
        });
    }

    const handleErrChange = (field, error) => {
        setErrors({
            ...errors,
            [field]: error
        });
    }

    const handleSubmit = (event) => { //TODO
        event.preventDefault();
        // reset errors
        setErrors(blankForm);
        setServerErr('');
        // check for blank name - return err
        if (!form.name.length) handleErrChange('name', 'Required');
        // check for valid email - return err
        else if (!validEmailRegex.test(form.email)) handleErrChange('email', 'Invalid email');
        // check password length - return err
        else if (form.password.length < 6) handleErrChange('password', 'Password must be at least 6 characters')
        // check matching passwords - return err
        else if (form.password !== form.passwordRpt) handleErrChange('passwordRpt', 'Passwords do not match')
        // if no errors send login cred. to server & handle response
        else {
            axios.post(`${API_URL}/register`, form).then(res => {
                // handle server response
                // login local user if signup successful
                if (res.data.message === 'signup-success') {
                    props.loginLocal(res.data.user, history);
                } else if (res.data === 'invalid-email') {
                    handleErrChange('email', 'Invalid email');
                } else {
                    setServerErr(res.data);
                }
                console.log(res)
            })
        }
    }

    return (
        <div className={'App'}>
            <Header />
            <h3>Sign Up</h3>
            <form className='login-form' noValidate>
                <label htmlFor='name'>Name</label>
                <input type="text" name="name" autoComplete='on' value={form.name}
                    onChange={handleInputChange} />
                {errors.name.length > 0 && <span className='err-msg'>{errors.name}</span>}
                <label htmlFor='email'>Email</label>
                <input type="email" name="email" autoComplete='on' value={form.email}
                    onChange={handleInputChange} />
                {errors.email.length > 0 && <span className='err-msg'>{errors.email}</span>}
                <label htmlFor='password'>Password</label>
                <input type="password" name="password" autoComplete='on' value={form.password}
                    onChange={handleInputChange} />
                {errors.password.length > 0 && <span className='err-msg'>{errors.password}</span>}
                <label htmlFor='passwordRpt'>Repeat Password</label>
                <input type="password" name="passwordRpt" autoComplete='on' value={form.passwordRpt}
                    onChange={handleInputChange} />
                {errors.passwordRpt.length > 0 && <span className='err-msg'>{errors.passwordRpt}</span>}
                <button className='mat-btn login-btn' onClick={handleSubmit}>
                    Register
                </button>
                {serverErr.length > 0 &&
                <div className='server-err'>
                    <p>{serverErr}</p>
                </div>
                }
            </form>
            <div className='form-link'>
                <p>Already have an account?</p>
                <Link to='/login'>Login Here</Link>
            </div>
        </div>
    )
}