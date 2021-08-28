import json
from django.views.generic.base import TemplateView


class IndexView(TemplateView):
    template_name = 'chatik/index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context['user'] = json.dumps({'id': self.request.user.id if self.request.user.id else None})
        return context
