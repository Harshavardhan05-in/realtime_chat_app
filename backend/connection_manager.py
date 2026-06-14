from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, user_id: int, websocket: WebSocket):

        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = [websocket]
        else:
            self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):

        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)

        if len(self.active_connections[user_id]) == 0:
            del self.active_connections[user_id]

    async def send_personal_message(self, receiver_id: int, message: dict):

        if receiver_id in self.active_connections:
            cns = self.active_connections[receiver_id]

            for s in cns:
                await s.send_json(message)


manager = ConnectionManager()
