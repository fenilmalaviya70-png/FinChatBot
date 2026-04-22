from app.services.rag_service import rag_service
import asyncio

async def main():
    try:
        answer = await rag_service.get_answer(
            question="Hello",
            chat_history=[],
            namespaces=[],
            feature_mode="General_Conversation"
        )
        print("RESPONSE:\n", answer)
    except Exception as e:
        print("EXCEPTION RAISED:\n", e)

if __name__ == '__main__':
    asyncio.run(main())
