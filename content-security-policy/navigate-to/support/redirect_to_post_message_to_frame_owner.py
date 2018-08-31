import time

def main(request, response):
    if "delayed" in request.GET:
        time.sleep(3)

    response.status = 302
    if "location" in request.GET:
        response.headers.set("Location", request.GET["location"])
    else:
        response.headers.set("Location", "post_message_to_frame_owner.html")