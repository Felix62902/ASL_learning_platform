from django.core.management.base import BaseCommand
from bs4 import BeautifulSoup
from datetime import date
from api.models import WordOfTheDay
import requests

def get_word_of_the_day():
    URL="https://www.dictionary.com/e/word-of-the-day/"
    try:
        response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status() # in case of bad response

        soup = BeautifulSoup(response.content, 'html.parser')

        word_container = soup.find('div',class_='otd-item-headword__word')
        if not word_container:
            print("Error: Could not find the word container")
            return None
        word = word_container.find('h1',class_='js-fit-text')

        if not word:
            print("Could not find the word of the day element on the page.")
            return None
        return word.text

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while fetching the page: {e}")
        return None


class Command(BaseCommand):
    help='Scrapes Dictionary.com for the Word of the Day and saves it to the database.'

    def handle(self, *args, **options):
        # main logic executed when script is run (python manage.py scrapewordoftheday.py)
        self.stdout.write("Starting the Word of the Day scraping process...")
        word = get_word_of_the_day()
        if not word:
            self.stdout.write(self.style.ERROR(f"Error: failed to scrape the word"))
            return None
        obj, created = WordOfTheDay.objects.update_or_create(
            date=date.today(),
            defaults={'word':word}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Successfully saved new word: {word}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully updated today's word: {word}"))




