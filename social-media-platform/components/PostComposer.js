export default function PostComposer({ redirectTo = "/feed" }) {
  return (
    <section className="card">
      <h2 className="section-title">Create a message</h2>
      <form
        className="stack-form"
        action="/api/posts"
        method="post"
        encType="multipart/form-data"
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <textarea
          name="content"
          className="textarea"
          placeholder="Share what is on your mind..."
          maxLength={320}
          required
        />
        <label className="file-label">
          <span>Attach image (optional)</span>
          <input type="file" name="image" accept="image/*" />
        </label>
        <button className="primary-btn" type="submit">
          Publish
        </button>
      </form>
    </section>
  );
}
