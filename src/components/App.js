import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Route, Routes, Navigate } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import { api } from "../utils/Api";
import CurrentUserContext from "../contexts/CurrentUserContext";
import PopupEditAvatar from "./PopupEditAvatar";
import PopupEditProfile from "./PopupEditProfile";
import PopupAddCard from "./PopupAddCard";
import Login from "./Login.js";
import Register from "./Register.js";
import ProtectedRoute from "./ProtectedRoute.js";
import InfoTooltip from "./InfoTooltip.js";
import { register, authorize, getContent } from "../utils/mestoAuth";

import successLogo from "../image/SuccessLogo.svg";
import failLogo from "../image/FailLogo.svg";
function App() {
  const navigate = useNavigate();
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  const [loggedIn, setLoggedIn] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [message, setMessage] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    handleTokenCheck();

    Promise.all([api.getInitialCards(), api.getProfile()])
      .then(([cards, userInfo]) => {
        setCurrentUser(userInfo);
        setCards(cards);
      })
      .catch((err) => console.log(err));
  }, []);

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleTokenCheck() {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      getContent(jwt)
        .then((res) => {
          if (res) {
            setUserInfo({ email: res.data.email });
            setLoggedIn(true);
            navigate("/");
          }
        })
        .catch((err) => console.log(err));
    }
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    if (!isLiked) {
      api
        .addLike(card._id, true)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === newCard._id ? newCard : c))
          );
        })
        .catch((err) => console.log(err));
    } else {
      api
        .deleteLike(card._id)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === newCard._id ? newCard : c))
          );
        })
        .catch((err) => console.log(err));
    }
  }

  function handleCardDelete(card) {
    const isOwn = card.owner._id === currentUser._id;
    if (isOwn) {
      api
        .deleteCard(card._id)
        .then(() => {
          setCards((state) => state.filter((c) => c._id !== card._id));
        })
        .catch((err) => console.log(err));
    }
  }
  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null);
    setIsInfoTooltipOpen(false);
  }
  function handleUpdateUser({ name, about }) {
    api
      .editProfile(name, about)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleUpdateAvatar({ avatar }) {
    api
      .changeAvatar(avatar)
      .then((res) => {
        setCurrentUser({ ...currentUser, avatar: res.avatar });
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }
  function handleAddPlaceSubmit({ name, link }) {
    api
      .addCard(name, link)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }
  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleRegister(email, password) {
    register(email, password)
      .then((result) => {
        if (result) {
          setMessage({
            imgPath: successLogo,
            text: "Вы успешно зарегистрировались!",
          });
          navigate("/signin");
        }
      })
      .catch(() =>
        setMessage({
          imgPath: failLogo,
          text: "Что-то пошло не так! Попробуйте ещё раз.",
        })
      )
      .finally(() => setIsInfoTooltipOpen(true));
  }

  function handleLogin(email, password) {
    authorize(email, password)
      .then((result) => {
        if (result) {
          localStorage.setItem("jwt", result.token);
          setLoggedIn(true);
          navigate("/");
          setUserInfo(email);
        }
      })
      .catch(() => {
        setMessage({
          imgPath: failLogo,
          text: "Что-то пошло не так! Попробуйте ещё раз.",
        });
        setIsInfoTooltipOpen(true);
      });
  }

  function handleSignOut() {
    setLoggedIn(false);
    setUserInfo("");
    localStorage.removeItem("jwt");
    navigate("/sign-in");
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <div className="page">
          <div className="page__container">
            <Header onSignOut={handleSignOut} userEmail={userInfo} />
            <Routes>
              <Route
                element={<ProtectedRoute loggedIn={loggedIn}></ProtectedRoute>}
              >
                <Route
                  exact
                  path={"/"}
                  element={
                    <>
                      <Main
                        cards={cards}
                        onEditAvatar={handleEditAvatarClick}
                        onEditProfile={handleEditProfileClick}
                        onAddPlace={handleAddPlaceClick}
                        onCardClick={handleCardClick}
                        onCardLike={handleCardLike}
                        onCardDelete={handleCardDelete}
                      />
                      <Footer />
                      <PopupWithForm
                        name="delete"
                        title="Вы уверены?"
                        onClose={closeAllPopups}
                        buttonText={"Да"}
                      ></PopupWithForm>

                      <ImagePopup
                        card={selectedCard}
                        onClose={closeAllPopups}
                      />

                      <PopupEditProfile
                        isOpen={isEditProfilePopupOpen}
                        onClose={closeAllPopups}
                        onUpdateUser={handleUpdateUser}
                      />

                      <PopupAddCard
                        isOpen={isAddPlacePopupOpen}
                        onClose={closeAllPopups}
                        onAddPlace={handleAddPlaceSubmit}
                      />

                      <PopupEditAvatar
                        isOpen={isEditAvatarPopupOpen}
                        onClose={closeAllPopups}
                        onUpdateAvatar={handleUpdateAvatar}
                      />
                    </>
                  }
                ></Route>
              </Route>
              <Route
                path="/signup"
                element={
                  <>
                    <Register onRegister={handleRegister} />
                    <InfoTooltip
                      name="tooltip"
                      isOpen={isInfoTooltipOpen}
                      onClose={closeAllPopups}
                      title={message.text}
                      imgPath={message.imgPath}
                    />
                  </>
                }
              ></Route>
              <Route
                path="/signin"
                element={
                  <>
                    <Login onLogin={handleLogin} />
                    <InfoTooltip
                      name="tooltip"
                      isOpen={isInfoTooltipOpen}
                      onClose={closeAllPopups}
                      title={message.text}
                      imgPath={message.imgPath}
                    />
                  </>
                }
              ></Route>
              <Route
                path={"*"}
                element={<Navigate replace to={loggedIn ? "/" : "/signin"} />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
