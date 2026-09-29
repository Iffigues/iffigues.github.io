package models

import "time"

type GitHubSearchResponse struct {
	TotalCount        int          `json:"total_count"`
	IncompleteResults bool         `json:"incomplete_results"`
	Items             []GitHubRepo `json:"items"`
}

type GitHubRepo struct {
	ID              int64     `json:"id"`
	Name            string    `json:"name"`
	FullName        string    `json:"full_name"`
	Owner           Owner     `json:"owner"`
	HTMLURL         string    `json:"html_url"`
	Description     string    `json:"description"`
	Fork            bool      `json:"fork"`
	StargazersCount int       `json:"stargazers_count"`
	ForksCount      int       `json:"forks_count"`
	WatchersCount   int       `json:"watchers_count"`
	Size            int       `json:"size"`
	OpenIssuesCount int       `json:"open_issues_count"`
	Language        string    `json:"language"`
	Archived        bool      `json:"archived"`
	Disabled        bool      `json:"disabled"`
	License         *License  `json:"license"`
	Topics          []string  `json:"topics"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	PushedAt        time.Time `json:"pushed_at"`
}

type Owner struct {
	Login     string `json:"login"`
	AvatarURL string `json:"avatar_url"`
	HTMLURL   string `json:"html_url"`
	Type      string `json:"type"`
}

type License struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	SPDX string `json:"spdx_id"`
}

type GitHubErrorResponse struct {
	Message string `json:"message"`
	Errors  []struct {
		Message string `json:"message"`
		Field   string `json:"field"`
		Code    string `json:"code"`
	} `json:"errors"`
}

type APIResponse struct {
	TotalResults int          `json:"total_results"`
	TotalPages   int          `json:"total_pages"`
	CurrentPage  int          `json:"current_page"`
	PerPage      int          `json:"per_page"`
	NextPage     *int         `json:"next_page"`
	PrevPage     *int         `json:"prev_page"`
	PagesURLs    []string     `json:"pages_urls"`
	Items        []GitHubRepo `json:"items,omitempty"` // Optionnel : renvoie aussi la liste complète des projets
}

type InvalidQueryError struct {
	Message string
}

func (e *InvalidQueryError) Error() string {
	return e.Message
}
