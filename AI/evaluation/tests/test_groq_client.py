import importlib

import pytest


def test_import_does_not_require_api_key(monkeypatch):
    """Importing the client must not raise when no key is configured."""

    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    module = importlib.import_module("AI.evaluation.llm.groq_client")
    importlib.reload(module)


def test_missing_key_is_reported_on_first_use(monkeypatch):

    from AI.evaluation.llm import groq_client

    monkeypatch.setattr(groq_client, "GROQ_API_KEY", None)
    monkeypatch.setattr(groq_client, "_client", None)

    with pytest.raises(RuntimeError, match="GROQ_API_KEY"):
        groq_client.generate_groq_response("hello")


class _FakeCompletions:
    def __init__(self):
        self.kwargs = None

    def create(self, **kwargs):
        self.kwargs = kwargs

        class _Message:
            content = "{\"ok\": true}"

        class _Choice:
            message = _Message()

        class _Response:
            choices = [_Choice()]

        return _Response()


class _FakeClient:
    def __init__(self):
        self.chat = type("Chat", (), {})()
        self.chat.completions = _FakeCompletions()


def test_model_argument_is_honoured(monkeypatch):

    from AI.evaluation.llm import groq_client

    fake = _FakeClient()
    monkeypatch.setattr(groq_client, "_client", fake)

    groq_client.generate_structured_json(
        "prompt",
        model="custom-model",
    )

    assert fake.chat.completions.kwargs["model"] == "custom-model"


def test_default_model_used_when_none_given(monkeypatch):

    from AI.evaluation.llm import groq_client

    fake = _FakeClient()
    monkeypatch.setattr(groq_client, "_client", fake)

    groq_client.generate_structured_json("prompt")

    assert (
        fake.chat.completions.kwargs["model"]
        == groq_client.GROQ_MODEL
    )
