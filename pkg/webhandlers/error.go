// Copyright © 2020 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package webhandlers

import (
	"encoding/json"
	"net/http"

	"github.com/getsentry/sentry-go"
	"go.thethings.network/lorawan-stack/pkg/errors"
	sentryerrors "go.thethings.network/lorawan-stack/pkg/errors/sentry"
)

// Error writes the error to the response writer.
func Error(w http.ResponseWriter, r *http.Request, err error) {
	code := errors.ToHTTPStatusCode(err)
	if code >= 500 {
		errEvent := sentryerrors.NewEvent(err)
		errEvent.Request = errEvent.Request.FromHTTPRequest(r)
		sentry.CaptureEvent(errEvent)
	}
	if ttnErr, ok := errors.From(err); ok {
		err = ttnErr
	}
	w.WriteHeader(code)
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	enc.Encode(err)
}
