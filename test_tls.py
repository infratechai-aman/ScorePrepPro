import tls_client

def test():
    session = tls_client.Session(
        client_identifier="chrome_120",
        random_tls_extension_order=True
    )
    res = session.get("https://www.shaalaa.com/course/maharashtra-board-10th-standard-ssc-english-medium_662")
    print(res.status_code)

if __name__ == "__main__":
    test()
