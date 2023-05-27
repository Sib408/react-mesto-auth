import React from "react";

export default function InfoTooltip({ isOpen, onClose, imgPath, title }) {
    return (
        <div className={`popup popup_type_tooltip ${isOpen && "popup_opened"}`}>

             <div className="popup__container popup__container-tooltip">
                <button className="popup__button popup__button_type_close" aria-label="закрыть" type="button" onClick={onClose}></button>

                    <img className="popup__open-tooltip" alt={imgPath} src={imgPath} />
                    <h2 className="popup__title">{title}</h2>
                </div>
            </div>

    );
}
