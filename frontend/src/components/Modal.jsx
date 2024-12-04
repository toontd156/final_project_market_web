import React, { useState } from "react";

function Modal({ isOpen, onClose, title, children, custom_max_width, custom_footer }) {
  const [open, setOpen] = useState(isOpen);
  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <div
      className={`modal fade  ${open ? "show" : ""}`}
      style={{ display: open ? "block" : "none" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: custom_max_width ? `${custom_max_width}` : '600px' }}
      >
        <div className="modal-content"  >
          <div className="modal-header">
            {
              title ? <h5 className="modal-title">{title}</h5> : ''
            }
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            {custom_footer}
            {/* <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary">
              {
                title === 'Add User' ? 'ADD' : 'Save changes'
              }
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
