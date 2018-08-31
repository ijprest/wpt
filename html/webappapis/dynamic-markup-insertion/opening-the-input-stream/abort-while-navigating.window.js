async_test(t => {
  const frame = document.body.appendChild(document.createElement("iframe"));
  t.add_cleanup(() => frame.remove());
  frame.src = "/common/blank.html";
  frame.onload = t.step_func(() => {
    frame.onload = null;
    const client = new frame.contentWindow.XMLHttpRequest();
    client.open("GET", "/common/blank.html");
    client.onabort = t.step_func_done(e => {
      frame.contentDocument.close();
    });
    client.send();
    frame.contentWindow.location.href = new URL("resources/dummy.html", document.URL);
    frame.contentWindow.document.open();
  });
}, "document.open() aborts documents that are navigating through Location (XMLHttpRequest)");

async_test(t => {
  const frame = document.body.appendChild(document.createElement("iframe"));
  t.add_cleanup(() => frame.remove());
  frame.src = "/common/blank.html";
  frame.onload = t.step_func(() => {
    frame.onload = null;
    frame.contentWindow.fetch("/common/blank.html").then(
      t.unreached_func("Fetch should have been aborted"),
      t.step_func_done(err => {
        frame.contentDocument.close();
      }));
    frame.contentWindow.location.href = new URL("resources/dummy.html", document.URL);
    frame.contentDocument.open();
  });
}, "document.open() aborts documents that are navigating through Location (fetch())");

async_test(t => {
  const frame = document.body.appendChild(document.createElement("iframe"));
  t.add_cleanup(() => frame.remove());
  frame.src = "/common/blank.html";
  frame.onload = t.step_func(() => {
    let happened = false;
    const img = frame.contentDocument.createElement("img");
    img.src = new URL("resources/slow-png.py", document.URL);
    img.onload = t.unreached_func("Image loading should have errored");
    img.onerror = t.step_func_done(() => {
      assert_true(happened);
    });
    // The image fetch starts in a microtask, so let's be sure to test after
    // the fetch has started.
    t.step_timeout(() => {
      frame.contentWindow.location.href = new URL("resources/dummy.html", document.URL);
      frame.contentDocument.open();
      happened = true;
    });
  });
}, "document.open() aborts documents that are navigating through Location (image loading)");

async_test(t => {
  const div = document.body.appendChild(document.createElement("div"));
  t.add_cleanup(() => div.remove());
  div.innerHTML = "<iframe src='/common/blank.html'></iframe>";
  const frame = div.childNodes[0];
  const client = new frame.contentWindow.XMLHttpRequest();
  client.open("GET", "/common/blank.html");
  client.onabort = t.step_func_done(e => {
    frame.contentDocument.close();
  });
  client.send();
  frame.contentWindow.document.open();
}, "document.open() aborts documents that are navigating through iframe loading (XMLHttpRequest)");

async_test(t => {
  const div = document.body.appendChild(document.createElement("div"));
  t.add_cleanup(() => div.remove());
  div.innerHTML = "<iframe src='/common/blank.html'></iframe>";
  const frame = div.childNodes[0];
  frame.contentWindow.fetch("/common/blank.html").then(
    t.unreached_func("Fetch should have been aborted"),
    t.step_func_done(err => {
      frame.contentDocument.close();
    }));
  frame.contentDocument.open();
}, "document.open() aborts documents that are navigating through iframe loading (fetch())");

async_test(t => {
  const div = document.body.appendChild(document.createElement("div"));
  t.add_cleanup(() => div.remove());
  div.innerHTML = "<iframe src='/common/blank.html'></iframe>";
  const frame = div.childNodes[0];
  let happened;
  const img = frame.contentDocument.createElement("img");
  img.src = new URL("resources/slow-png.py", document.URL);
  img.onload = t.unreached_func("Image loading should have errored");
  img.onerror = t.step_func_done(() => {
    assert_true(happened);
  });
  // The image fetch starts in a microtask, so let's be sure to test after
  // the fetch has started.
  t.step_timeout(() => {
    frame.contentDocument.open();
    happened = true;
  });
}, "document.open() aborts documents that are navigating through iframe loading (image loading)");
