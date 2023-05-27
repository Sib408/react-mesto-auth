import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ userEmail, onSignOut }){
  const location = useLocation();
  let {email} = userEmail || {};

  return(
      <header className="header">
        <div className="header__logo"/>
        <div className={`header__info ${location.pathname === '/' && "header__info_inactive"}`}>
       {location.pathname === '/' ?
          <>
            <div className="header__email">{email}</div>
            <Link onClick={onSignOut} className="header__signout" to={'/signin'}>Выйти</Link>
          </>
          : location.pathname === '/signin' ?
            <Link className="header__signout" to={'/signup'}>Регистрация</Link>
            : location.pathname === '/signup' ?
              <Link className="header__signout" to={'/signin'}>Войти</Link> : ""}
              </div>
      </header>
  )
}

export default Header;

