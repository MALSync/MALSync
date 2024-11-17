# Disney Plus

Implementing this extension has been difficult since there is very little consistency in the way D+ shows their content.

## Anime on D+

<details>
  <summary>Full description of each anime</summary>
- BLEACH: Thousand-Year Blood War  
  Consolidates all seasons into a single entry
  1.  Season 1: Bleach: Thousand-Year Blood War : `Bleach: Sennen Kessen-hen`
  2.  Season 2: Bleach: Thousand-Year Blood War - The separation : `Bleach: Sennen Kessen-hen - Ketsubetsu-tan`
  3.  Season 3: Bleach: Thousand-Year Blood War - The Conflict : `Bleach: Sennen Kessen-hen - Soukoku-tan`  
      Episode titles do seem to match
- Bleach  
  Arbitrary seasons that do not exist on MAL  
  Episode names contain their number, counts through all seasons
- (Marvel) Future Avengers  
  Only season 2 is present, I have added the episodes into MAL (pending approval)
- Tokyo Revengers  
  Only contains a season 2, which is 2 entries combined:

1. `Tokyo Revengers: Christmas Showdown` | `Tokyo Revengers: Seiya Kessen-hen` (1-13)
2. `Tokyo Revengers: Tenjiku Arc` | `Tokyo Revengers: Tenjiku-hen` (14-26)

The episode names do match

- Mission: Yozakura Family  
  Contains everything  
  Has correct numbering and episode titles
- Tengoku Daimakyo (Heavenly Delusion)  
  Contains everything  
  Has correct numbering and episode titles
- Ishura  
  Contains everything  
  Has correct numbering and episode titles
- Undead Unluck  
  Contains everything  
  Has correct numbering and episode titles
- Go! Go! Loser Ranger!  
  Contains everything  
  Has correct numbering and episode titles
- The Fable  
  Contains everything  
  Has correct numbering and episode titles
- Murai In Love  
  Contains everything  
  Has correct numbering and episode titles
- Summer Time Rendering  
  Contains everything  
  Has correct numbering and episode titles
- Code Geass: Rozé of the Recapture  
  Contains everything  
  Has correct numbering and episode titles
- The Tatami Time Machine Blues  
  Contains everything  
  Has correct numbering and episode titles
- Sand Land: The Series  
  Contains everything  
  Names mostly match (the end is the same)
- Star Wars: Visions  
  Contains everything  
  Has correct numbering and episode titles  
  Has a season 2 which is not on MAL
- BLACK ROCK SHOOTER DOWNFALL  
  Title differs slightly: `Black★★Rock Shooter: Dawn Fall`  
  Contains all episodes, correct numbering and correct titles
- Synduality Noir  
  Has seasons 1/2 merged (`Synduality: Noir Part 2`)
  Episode numbers reset in S2  
  Episode titles are correct
- Phoenix: Eden17  
 Has everything  
 Episode numbers and titles are correct
</details>

| Title                                | Correct title                                       | Contains Everything                    | Split seasons | Merged seasons | Correct episode titles | Correct episode number in title           |
| ------------------------------------ | --------------------------------------------------- | -------------------------------------- | ------------- | -------------- | ---------------------- | ----------------------------------------- |
| Bleach: Thousand-Year Blood War      | No: Merges entries                                  | Yes                                    | No            | Yes            | Yes                    | Yes (restarts per season)                 |
| Bleach                               | Yes                                                 | Yes                                    | Yes           | No             | No                     | Yes (continues through arbitrary seasons) |
| Future Avengers                      | No: `Marvel Future Avengers`                        | Only S2                                | No            | No             | Pending approval       | Yes                                       |
| Tokyo Revengers                      | No: Merges entries                                  | Only S2                                | No            | Yes            | Yes                    | Yes (restarts per arc)                    |
| Mission: Yozakura Family             | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Tengoku Daimakyo (Heavenly Delusion) | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Ishura                               | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Undead Unluck                        | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Go! Go! Loser Ranger!                | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| The Fable                            | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Murai In Love                        | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Summer Time Rendering                | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Code Geass: Rozé of the Recapture    | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| The Tatami Time Machine Blues        | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Sand Land: The Series                | Yes                                                 | Yes                                    | No            | No             | Mostly                 | Yes                                       |
| Star Wars: Visions                   | Yes                                                 | Yes (also has S2, which is not on MAL) | No            | No             | Yes                    | Yes                                       |
| BLACK ROCK SHOOTER DOWNFALL          | Slight difference: `Black★★Rock Shooter: Dawn Fall` | Yes                                    | No            | No             | Yes                    | Yes                                       |
| Synduality Noir                      | Yes                                                 | Yes                                    | No            | Yes            | Yes                    | No (resets in S2)                         |
| Phoenix: Eden17                      | Yes                                                 | Yes                                    | No            | No             | Yes                    | Yes                                       |
|                                      | 16/19                                               | 17/19                                  | 1/19          | 3/19           | 17/19                  | 18/19                                     |

## Approach

Since not all entries have an exact title match, use Jikan API instead:

1. Search Jikan based on the given title
2. Get the episode list of the top X results
3. Traverse the episode list and find a title match (string similarity to account for slight changes)
4. When a match is found, this gives the correct MAL entry and it's episode number
5. When no match is found this way, revert to given title and episode number, depend on MalSync corrections if these are not correct
