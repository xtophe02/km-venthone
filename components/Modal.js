export default function Modal({
  credentials,
  credentialsHandler,
  modalHandler,
  handleSubmit,
}) {
  return (
    <div className={`modal ${credentials.open && "is-active"}`}>
      <div className="modal-background"></div>
      <form className="modal-content" onSubmit={handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Username"
              name="username"
              value={credentials.username}
              onChange={credentialsHandler}
            />
          </div>
        </div>
        <div className="field">
          <div className="control">
            <input
              className="input"
              type="password"
              placeholder="Password"
              name="password"
              value={credentials.password}
              onChange={credentialsHandler}
            />
          </div>
        </div>
        <div className="field is-grouped">
          <div className="control">
            <button className="button is-link" type="submit">
              Submit
            </button>
          </div>
          <div className="control">
            <button className="button is-link is-light" onClick={modalHandler}>
              Cancel
            </button>
          </div>
        </div>
      </form>
      <button
        className="modal-close is-large"
        aria-label="close"
        // onClick={modalHandler}
      ></button>
    </div>
  );
}
